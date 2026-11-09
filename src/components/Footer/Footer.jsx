import { useState } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
import icon from '../../assets/icon.png';
import './Footer.css';

export default function Footer() {
  const [copied, setCopied] = useState(false);
  
  // Chave aleatória
  const pixKey = "ca971ac7-bd90-4561-8981-a7a7967633b4";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <footer className="kitbook-footer">
      {/* Seção de Apoio / Pix */}
      <div className="support-card">
        <div className="support-header">
          <Heart size={20} className="heart-icon" />
          <h4>Gostou do KitBook?</h4>
        </div>
        <p className="support-text">
          Se este aplicativo te ajudou a organizar suas leituras e você quiser colaborar com o projeto, qualquer apoio é super bem-vindo! 💖<img className='paw' src={icon} alt="Ícone da patinha" />
        </p>
        
        <div className="pix-box">
          <span className="pix-label">Chave Pix:</span>
          <div className="pix-input-group">
            <input type="text" readOnly value={pixKey} className="pix-input" />
            <button className="btn-copy-pix" onClick={handleCopyPix}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <p className="thank-you-text">Muito obrigada por usar o meu app! 😉✨</p>
      </div>

      {/* Seção Principal do Rodapé (Direitos e Contato) */}
      <div className="footer-content">
        <div className="footer-brand">
          <p className="copyright-text">
            © {new Date().getFullYear()} <strong>KitBook</strong>. Desenvolvido com carinho por Natália Peralta.
          </p>
          <p className="rights-text">Todos os direitos reservados.</p>
        </div>

        <div className="footer-links">
          <a 
            href="http://www.linkedin.com/in/nat%C3%A1lia-peralta" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            
            <span>LinkedIn</span>
          </a>

          <a 
            href="https://github.com/NatiPeralta" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            
            <span>GitHub</span>
          </a>

          <a 
            href="mailto:nati.g.peralta@hotmail.com" 
            className="footer-link"
          >
            
            <span>Contato</span>
          </a>
        </div>
      </div>
    </footer>
  );
}