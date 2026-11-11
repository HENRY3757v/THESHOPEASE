import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import UsersList from './pages/UsersList'
import Shop from './pages/Shop'
import Orders from './pages/Orders'
import SellerPortal from './pages/SellerPortal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/seller" element={<SellerPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={<UsersList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
