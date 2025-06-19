'use client'
import Swal from 'sweetalert2'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set } from 'firebase/database'
import { useState, useEffect } from 'react'

const apiKey = process.env.NEXT_PUBLIC_API_KEY
const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET
const messagingSenderId = process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID
const appId = process.env.NEXT_PUBLIC_APP_ID
const databaseURL = process.env.NEXT_PUBLIC_DATABASE_URL

// Firebase Config
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  databaseURL: databaseURL,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig, 'fb0529')
const database = getDatabase(app)

export function Dashboard({ points }) {
  const [login, setLogin] = useState(false)
  const [email, setEmail] = useState('')
  // const [allUsers, setAllUsers] = useState([])

  // Fetch all users
  const fetchAllUsers = async () => {
    const accountsRef = ref(database, 'accounts')
    const snapshot = await get(accountsRef)

    if (snapshot.exists()) {
      const data = snapshot.val()
      const usersArray = Object.values(data).map((user) => ({
        email: user.email,
        points: user.points || 0,
      }))
      usersArray.sort((a, b) => b.points - a.points)
      // setAllUsers(usersArray)
    }
  }

  // Auto-update points if logged in
  useEffect(() => {
    if (!login || !email) return

    const updatePoints = async () => {
      const userKey = email.replaceAll('.', '_')
      const userRef = ref(database, `accounts/${userKey}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const userData = snapshot.val()
        if (points > (userData.points || 0)) {
          await set(userRef, { email, points })
          console.log('[Auto Update] Points updated.')
        }
      }
    }

    updatePoints()
  }, [points, login, email])

  // Form submission logic
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const inputEmail = document.getElementById('email').value
    const userKey = inputEmail.replaceAll('.', '_')
    const userRef = ref(database, `accounts/${userKey}`)

    const snapshot = await get(userRef)

    if (snapshot.exists()) {
      const userData = snapshot.val()
      if (points > (userData.points || 0)) {
        await set(userRef, { email: inputEmail, points })
        Swal.fire('Updated!', 'Points updated successfully.', 'success')
      } else {
        Swal.fire(
          'No Update',
          'Your score is not higher than existing.',
          'info'
        )
      }
    } else {
      await set(userRef, { email: inputEmail, points })
      Swal.fire('Success!', 'New account created.', 'success')
    }

    setLogin(true)
    setEmail(inputEmail)
    fetchAllUsers()
  }

  const showDashboard = async () => {
    const accountsRef = ref(database, 'accounts')
    const snapshot = await get(accountsRef)

    let usersArray = []
    if (snapshot.exists()) {
      const data = snapshot.val()
      usersArray = Object.values(data).map((user) => ({
        email: user.email,
        points: user.points || 0,
      }))
      usersArray.sort((a, b) => b.points - a.points)
    }

    const leaderboardHTML = usersArray
      .map(
        (user, idx) =>
          `<tr><td>${idx + 1}</td><td>${user.email}</td><td>${user.points}</td></tr>`
      )
      .join('')

    const leaderboardTable = `
      <div style="margin-top: 1rem;">
        <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem;">🏆 Leaderboard</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">#</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">Email</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ccc;">Points</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboardHTML || `<tr><td colspan="3" style="padding: 8px;">No users yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    `

    const loginForm = `
      <form id="loginForm" style="margin-top: 1rem;">
        <label for="email" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Email:</label>
        <input type="email" id="email" name="email" required class="swal2-input" style="width: 80%; padding: 0.5rem; margin-bottom: 1rem;" placeholder="Enter your email">
        <button type="submit" class="swal2-confirm swal2-styled" style="width: 100%;">Submit</button>
      </form>
    `

    Swal.fire({
      title: 'Dashboard',
      html: `
      <p>Your Points: ${points}</p>
      ${!login ? loginForm : `<p>Welcome, ${email}</p>`}
      <hr />
      ${leaderboardTable}
    `,
      showConfirmButton: false,
      didOpen: () => {
        if (!login) {
          const form = Swal.getPopup().querySelector('#loginForm')
          form.addEventListener('submit', handleFormSubmit)
        }
      },
    })
  }

  return (
    <button
      onClick={showDashboard}
      className="bg-white/80 text-black px-4 py-2 rounded shadow"
    >
      Dashboard
    </button>
  )
}
