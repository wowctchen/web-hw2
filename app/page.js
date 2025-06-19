'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  RoundedBox,
  CameraControls,
  Environment,
  useGLTF,
  ContactShadows,
  PerspectiveCamera,
  KeyboardControls,
  useKeyboardControls,
  Box,
} from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import Swal from 'sweetalert2'
import { ClawModel } from './ClawModel'
import { Dashboard } from './Dashboard'

function Camera({
  setClawPos,
  boxRef,
  clawPos,
  isLowering,
  setIsLowering,
  hasPrize,
  setHasPrize,
}) {
  const cameraRef = useRef()

  //  [注意] useFrame and useKeyboardControls 都需要放在 Canvas 的子组件中

  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 1, 0)
    }
  })

  const [, getKeys] = useKeyboardControls()

  useFrame((state) => {
    const { forward, backward, left, right, jump } = getKeys()
    const speed = 0.01
    const limitX = 0.4
    const limitZ = 0.4

    if (boxRef.current) {
      if (!isLowering) {
        if (forward) {
          setClawPos({ x: clawPos.x, y: clawPos.y, z: clawPos.z - speed })
        }
        if (backward) {
          setClawPos({ x: clawPos.x, y: clawPos.y, z: clawPos.z + speed })
        }
        if (left) {
          setClawPos({ x: clawPos.x - speed, y: clawPos.y, z: clawPos.z })
        }
        if (right) {
          setClawPos({ x: clawPos.x + speed, y: clawPos.y, z: clawPos.z })
        }

        if (clawPos.x > limitX) {
          setClawPos({ x: limitX, y: clawPos.y, z: clawPos.z })
        }
        if (clawPos.x < -limitX) {
          setClawPos({ x: -limitX, y: clawPos.y, z: clawPos.z })
        }
        if (clawPos.z > limitZ) {
          setClawPos({ x: clawPos.x, y: clawPos.y, z: limitZ })
        }
        if (clawPos.z < -limitZ) {
          setClawPos({ x: clawPos.x, y: clawPos.y, z: -limitZ })
        }

        if (jump) {
          setHasPrize(false)
          console.log('jump')
          setIsLowering(true)

          //setClawPos with gsap
          console.log('down')

          //gsap convet to timeline
          // gsap.to(clawPos, { y: 2, duration: 2, onComplete: () => {

          // } });

          // 隨機變數判斷是否中獎
          const random = Math.random()
          const isWin = random < 0.5

          // Has Prize 在這裡不會被更新，給同學練習
          setHasPrize(isWin)

          //gsap convet to timeline
          gsap
            .timeline()
            .to(clawPos, { y: 2, duration: 2 })
            .to(clawPos, { y: 2.7, duration: 3 })
            .then(() => {
              setIsLowering(false)
              if (isWin) {
                console.log('中獎')
                Swal.fire({
                  title: '中獎了',
                  text: '恭喜你中獎了',
                  icon: 'success',
                  confirmButtonText: '確定',
                })
              } else {
                console.log('沒中獎')
                Swal.fire({
                  title: '沒中獎',
                  text: '再接再厲',
                  icon: 'error',
                  confirmButtonText: '確定',
                })
              }
            })
        }
      }
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 1, 3]} // 3 ~ 6
    />
  )
}

export default function Home() {
  const boxRef = useRef()
  const isHidden = true

  const [clawPos, setClawPos] = useState({ x: -0.4, y: 2.7, z: 0.2 })
  const [isLowering, setIsLowering] = useState(false)
  const [hasPrize, setHasPrize] = useState(false)
  const [points, setPoints] = useState(0)

  useEffect(() => {
    if (hasPrize) {
      setTimeout(() => {
        setPoints((prev) => prev + 1)
      }, 5000)
    }
    setHasPrize(false)
  }, [hasPrize])

  const showRules = () => {
    Swal.fire({
      title: '遊戲規則',
      text: '用 WASD 遊戲,空白鍵夾娃娃; 從右上角的按鈕登入可以查看排行榜',
    })
  }

  return (
    <div className="w-full h-screen relative">
      <div className="absolute w-full top-4 px-4 z-10 flex flex-row gap-1">
        <div className="flex flex-row">
          <button
            onClick={() => showRules()}
            className="bg-white/80 text-black px-4 py-2 rounded shadow"
          >
            Rules
          </button>
          <div className=" bg-white/80 text-black px-4 py-2 rounded shadow">
            🎯 Points: {points}
          </div>
        </div>
        <div className="ml-auto">
          <Dashboard points={points} />
        </div>
      </div>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
          { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
          { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
          { name: 'jump', keys: ['Space'] },
        ]}
      >
        <Canvas>
          <ambientLight intensity={Math.PI / 2} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            decay={0}
            intensity={Math.PI}
          />
          <pointLight
            position={[-10, -10, -10]}
            decay={0}
            intensity={Math.PI}
          />

          {!isHidden && (
            <RoundedBox
              args={[1, 1, 1]} // Width, height, depth. Default is [1, 1, 1]
              radius={0.05} // Radius of the rounded corners. Default is 0.05
              smoothness={4} // The number of curve segments. Default is 4
              bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
              creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
            >
              <meshPhongMaterial color="#f3f3f3" />
            </RoundedBox>
          )}

          <Box ref={boxRef} args={[0.1, 0.1, 0.1]} position={[0, 0, 0]}>
            <meshPhongMaterial color="#f3f3f3" />
          </Box>

          <Suspense fallback={null}>
            <ClawModel
              clawPos={clawPos}
              isLowering={isLowering}
              hasPrize={hasPrize}
            />
          </Suspense>

          <Environment
            background={true}
            backgroundBlurriness={0.5}
            backgroundIntensity={1}
            environmentIntensity={1}
            preset={'city'}
          />

          <ContactShadows
            opacity={1}
            scale={10}
            blur={10}
            far={10}
            resolution={256}
            color="#DDDDDD"
          />

          <Camera
            boxRef={boxRef}
            clawPos={clawPos}
            setClawPos={setClawPos}
            isLowering={isLowering}
            setIsLowering={setIsLowering}
            hasPrize={hasPrize}
            setHasPrize={setHasPrize}
          />
          <CameraControls enablePan={false} enableZoom={false} />
          <axesHelper args={[10]} />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}
