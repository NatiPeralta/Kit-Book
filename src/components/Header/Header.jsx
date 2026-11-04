import logoImg from '../../assets/logo.png'; // Ajuste o caminho conforme a sua pasta de assets
import './Header.css';

export default function Header() {
  return (
    <header className="app-header">
      <img 
        src={logoImg} 
        alt="KitBook Logo" 
        className="app-logo-img" 
      />
      <p className="app-slogan">
        Sua estante física e digital organizada com charme felino 🤍
      </p>
    </header>
  );
}