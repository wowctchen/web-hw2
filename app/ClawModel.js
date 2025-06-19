'use client'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'

export function ClawModel({ clawPos, isLowering, hasPrize }) {
  const clawModel = useGLTF(`claw.glb`)
  const clawModelRef = useRef()

  useFrame((state) => {
    if (clawModelRef.current) {
      //用 foreach 尋找 clawModelRef 中，名稱為 claw 物件，並且將其 rotation.y 增加 0.01
      clawModelRef.current.traverse((child) => {
        if (child.name === 'claw') {
          child.position.set(clawPos.x, clawPos.y, clawPos.z)
        }

        if (isLowering) return

        if (child.name === 'clawBase') {
          child.position.set(clawPos.x, clawPos.y + 0.15, clawPos.z)
        }

        if (child.name === 'track') {
          child.position.set(0.011943, clawPos.y + 0.15, clawPos.z)
        }

        if (child.name === 'bear') {
          child.visible = hasPrize
        }
      })
    }
  })

  return (
    <primitive
      ref={clawModelRef}
      object={clawModel.scene}
      scale={[0.6, 0.6, 0.6]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  )
}
