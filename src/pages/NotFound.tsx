import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center fade-up max-w-md">
        <div className="w-20 h-20 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="search_off" className="text-on-primary text-4xl" />
        </div>
        <div className="font-display-lg text-display-lg font-bold text-primary mb-2">404</div>
        <h1 className="font-headline-md text-headline-md font-bold text-on-background mb-2">Page Not Found</h1>
        <p className="text-on-surface-variant text-body-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-150 active:scale-95 flex items-center gap-sm mx-auto"
        >
          <Icon name="home" />
          Go Home
        </button>
      </div>
    </div>
  )
}
