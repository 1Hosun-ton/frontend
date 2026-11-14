import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import TabLayout from './layouts/TabLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import Login from './pages/Login/Login.jsx'
import Signup from './pages/Signup/Signup.jsx'
import WeeklyBudget from './pages/WeeklyBudget/WeeklyBudget.jsx'
import Home from './pages/Home/Home.jsx'
import Records from './pages/Records/Records.jsx'
import Insights from './pages/Insights/Insights.jsx'
import Missions from './pages/Missions/Missions.jsx'
import More from './pages/More/More.jsx'
import RecordNew from './pages/RecordNew/RecordNew.jsx'
import AppInfo from './pages/AppInfo/AppInfo.jsx'
import { ToastProvider } from './components/Toast/Toast.jsx'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app">
          <Routes>
            {/* 하단 탭 있는 화면 */}
            <Route element={<TabLayout bg="grey" />}>
              <Route path="/" element={<Home />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/missions" element={<Missions />} />
            </Route>
            <Route element={<TabLayout bg="white" />}>
              <Route path="/records" element={<Records />} />
              <Route path="/more" element={<More />} />
            </Route>
  
            {/* 하단 탭 없는 로그인·회원가입·주간 예산 화면 */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/budget" element={<WeeklyBudget />} />
            </Route>

            {/* 하단 탭 없는 화면 */}
            <Route path="/records/new" element={<RecordNew />} />
            <Route path="/more/info" element={<AppInfo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <div id="overlay-root" className="app-overlay-root" />
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
