import { useEffect, useState } from 'react'
import axios from 'axios'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import ListProductPage from './pages/ListProductPage'
import ListedProductsPage from './pages/ListedProductsPage'
import './App.css'

const ADMIN_TOKEN_STORAGE_KEY = 'adminAuthToken'
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})

function App() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || '')
  const [isAuthChecking, setIsAuthChecking] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const clearAuth = (message = 'Please login again.') => {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
    setAuthToken('')
    setProducts([])
    setNoticeMessage('')
    setErrorMessage(message)
  }

  const applyAuthHeader = (token) => {
    if (token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
      return
    }

    delete apiClient.defaults.headers.common.Authorization
  }

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const response = await apiClient.get('/api/products')
      setProducts(response.data)
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuth('Session expired. Please login again.')
        return
      }

      const message = error.response?.data?.message || 'Failed to load products from backend.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authToken) {
      applyAuthHeader('')
      return
    }

    const checkSession = async () => {
      try {
        setIsAuthChecking(true)
        applyAuthHeader(authToken)
        await apiClient.get('/api/admin/session')
        fetchProducts()
      } catch (_error) {
        clearAuth('Session expired. Please login again.')
      } finally {
        setIsAuthChecking(false)
      }
    }

    checkSession()
  }, [authToken])

  const handleLoginInputChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsLoggingIn(true)
      setLoginError('')

      const response = await apiClient.post('/api/admin/login', {
        email: loginForm.email,
        password: loginForm.password,
      })

      const token = response.data?.token

      if (!token) {
        setLoginError('Login failed. Token was not received.')
        return
      }

      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token)
      setAuthToken(token)
      setLoginForm({ email: '', password: '' })
      setErrorMessage('')
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
      setLoginError(message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    clearAuth('Logged out successfully.')
  }

  const addProduct = async (formData) => {
    try {
      setErrorMessage('')
      setNoticeMessage('Uploading images to Cloudinary and saving product...')

      const response = await apiClient.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setProducts((prev) => [response.data, ...prev])
      setNoticeMessage('Product listed successfully.')
      return true
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuth('Session expired. Please login again.')
        return false
      }

      const message = error.response?.data?.message || 'Failed to create product.'
      setErrorMessage(message)
      setNoticeMessage('')
      return false
    }
  }

  const deleteProduct = async (id) => {
    try {
      setErrorMessage('')
      await apiClient.delete(`/api/products/${id}`)
      setProducts((prev) => prev.filter((item) => item._id !== id))
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuth('Session expired. Please login again.')
        return
      }

      const message = error.response?.data?.message || 'Failed to delete product.'
      setErrorMessage(message)
    }
  }

  if (!authToken) {
    return (
      <div className="admin-shell">
        <main className="admin-login-wrap">
          <section className="admin-login-card">
            <h1>Admin Login</h1>
            <p>Use the built-in admin email and password to continue.</p>

            {errorMessage && <p className="error-note">{errorMessage}</p>}
            {loginError && <p className="error-note">{loginError}</p>}

            <form className="form-grid" onSubmit={handleLoginSubmit}>
              <label htmlFor="email">
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginInputChange}
                  required
                />
              </label>

              <label htmlFor="password">
                Password
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginInputChange}
                  required
                />
              </label>

              <button type="submit" className="btn btn-primary" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </section>
        </main>
      </div>
    )
  }

  if (isAuthChecking) {
    return (
      <div className="admin-shell">
        <main className="admin-login-wrap">
          <section className="admin-login-card">
            <h1>Checking session...</h1>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <header className="header-bar">
        <h1>Admin Panel</h1>
        <nav className="tabs">
          <NavLink to="/list-product" className={({ isActive }) => (isActive ? 'active' : '')}>
            List Product
          </NavLink>
          <NavLink to="/listed-products" className={({ isActive }) => (isActive ? 'active' : '')}>
            Listed Products
          </NavLink>
        </nav>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>Logout</button>
      </header>

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to="/list-product" replace />} />
          <Route path="/list-product" element={<ListProductPage onAddProduct={addProduct} notice={noticeMessage} />} />
          <Route
            path="/listed-products"
            element={(
              <ListedProductsPage
                products={products}
                onDeleteProduct={deleteProduct}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onRefresh={fetchProducts}
              />
            )}
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
