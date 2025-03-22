import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis Root:_, une intelligence artificielle avancée. Comment puis-je vous aider aujourd'hui ?", sender: 'bot', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isError, setIsError] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Référence pour la zone des messages
  const messagesContainerRef = useRef(null);
  
  // Détection si l'appareil est mobile
  const isMobile = window.innerWidth <= 768;
  
  // Effet pour l'animation des particules de code
  useEffect(() => {
    // Création de l'effet code en arrière-plan
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;
    
    const codeBackground = document.createElement('div');
    codeBackground.className = 'code-background';
    messagesContainer.appendChild(codeBackground);
    
    const codeSnippets = [
      'function analyzeInput(text) {',
      'return semanticEngine.process(text);',
      'const response = await neuralNetwork.generate();',
      'class NeuralPathway extends Synapse {',
      'const memory = new ShortTermMemory();',
      'async function processIntent(userInput) {',
      'if (sentiment.analyze(text) > 0.7) {',
      'for (let node of knowledgeGraph) {',
      'const entities = NER.extract(message);',
      'memory.store(conversation.context);',
      'return new Response(generated, context);'
    ];
    
    // Création des lignes de code en arrière-plan
    for (let i = 0; i < 15; i++) {
      const codeLine = document.createElement('div');
      codeLine.className = 'code-line';
      codeLine.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      codeLine.style.left = `${Math.random() * 100}%`;
      codeLine.style.animationDuration = `${10 + Math.random() * 20}s`;
      codeLine.style.animationDelay = `${Math.random() * 5}s`;
      codeBackground.appendChild(codeLine);
    }
    
    // Nettoyage de l'effet
    return () => {
      if (messagesContainer.contains(codeBackground)) {
        messagesContainer.removeChild(codeBackground);
      }
    };
  }, []);
  
  // Optimisation pour mobile - ajustement automatique de la hauteur du conteneur de messages
// Ajoutez ce code dans votre composant Chatbot.jsx, dans la section des useEffect

// Détection du clavier virtuel pour iOS et Android
useEffect(() => {
  // Pour les appareils mobiles seulement
  if (!isMobile) return;
  
  const detectKeyboard = () => {
    // Une façon approximative de détecter si le clavier virtuel est ouvert
    // en comparant la hauteur de la fenêtre avant et après la mise au point de l'entrée
    const windowHeight = window.innerHeight;
    
    const handleFocus = () => {
      // Attendre un peu que le clavier apparaisse
      setTimeout(() => {
        if (window.innerHeight < windowHeight * 0.8) {
          // Le clavier est probablement ouvert
          document.body.classList.add('keyboard-open');
          
          // Ajuster la hauteur du conteneur de messages
          if (messagesContainerRef.current) {
            messagesContainerRef.current.style.maxHeight = 'calc(100vh - 120px)';
          }
        }
      }, 300);
    };
    
    const adjustHeight = () => {
      if (messagesContainerRef.current && isMobile) {
        const viewHeight = window.innerHeight;
        const headerHeight = document.querySelector('.chatbot-header')?.offsetHeight || 0;
        const formHeight = document.querySelector('.message-input-form')?.offsetHeight || 0;
        const suggestionsHeight = document.querySelector('.chatbot-suggestions')?.offsetHeight || 0;
        
        // Calculer la hauteur disponible
        const availableHeight = viewHeight - headerHeight - formHeight - suggestionsHeight - 20; // 20px pour marges
        
        // Définir la hauteur du conteneur de messages
        messagesContainerRef.current.style.height = `${Math.max(300, availableHeight)}px`;
      }
    };
    
    const handleBlur = () => {
      // Le clavier est probablement fermé
      document.body.classList.remove('keyboard-open');
      
      // Réajuster la hauteur du conteneur de messages
      if (messagesContainerRef.current) {
        messagesContainerRef.current.style.maxHeight = '';
        // Forcer un réajustement de la hauteur
        adjustHeight();
      }
      
      // Défiler vers le bas après la fermeture du clavier
      setTimeout(scrollToBottom, 300);
    };
    
    // Sélectionner l'élément d'entrée
    const inputElement = document.querySelector('.message-input-form input');
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
    }
    
    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      }
    };
  };
  
  const cleanup = detectKeyboard();
  return cleanup;
}, [isMobile]);

  const sendMessageToClaude = async (message) => {
    try {
      setIsError(false);
      const response = await fetch('https://rootapi-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la communication avec l'API: ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Erreur lors de la communication avec Claude:', error);
      setIsError(true);
      return "Je rencontre des difficultés momentanées à accéder à mes systèmes principaux. Pourriez-vous réessayer dans un instant ?";
    }
  };

  const saveMessageToDB = async (msg) => {
    try {
      await fetch('https://rootapi-production.up.railway.app/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
    } catch (err) {
      console.error("Erreur enregistrement message dans PostgreSQL:", err);
    }
  };

  // Fonction de défilement améliorée pour mobile
  const scrollToBottom = () => {
    // Assurez-vous que le défilement se produit après le rendu
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end', 
          inline: 'nearest' 
        });
      }
    }, 100);
  };

  // Défilement après chargement initial et après ajout de messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Défilement supplémentaire lorsque la réponse du bot est complète
  useEffect(() => {
    // Défilement forcé lorsque isTyping passe de true à false (fin de réponse)
    if (!isTyping && messages.length > 1 && messages[messages.length - 1].sender === 'bot') {
      scrollToBottom();
      
      // Double vérification pour s'assurer que le défilement a bien eu lieu (particulièrement important sur mobile)
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 1000);
    }
  }, [isTyping, messages]);

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (inputMessage.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Défiler immédiatement après l'envoi du message utilisateur
    scrollToBottom();

    const dbUser = {
      sender: 'user',
      source: 'public',
      content: inputMessage,
      type: 'text',
      attachmentUrl: null
    };
    await saveMessageToDB(dbUser);

    const botResponse = await sendMessageToClaude(inputMessage);

    const botMessage = {
      id: messages.length + 2,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);

    const dbBot = { ...dbUser, sender: 'bot', content: botResponse };
    await saveMessageToDB(dbBot);

    setIsTyping(false);
    
    // Défiler à nouveau après réception de la réponse
    scrollToBottom();
  };

  // Effet pour simuler les particules tech
  useEffect(() => {
    const createParticles = () => {
      const techParticles = document.createElement('div');
      techParticles.className = 'tech-particles';
      document.body.appendChild(techParticles);

      // Réduire le nombre de particules sur mobile pour la performance
      const particleCount = isMobile ? 15 : 30;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Position aléatoire
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        
        // Animation
        particle.style.animation = `
          fadeInOut ${5 + Math.random() * 10}s infinite alternate,
          float ${10 + Math.random() * 20}s infinite alternate
        `;
        
        // Délai d'animation
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        // Taille aléatoire
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Opacité aléatoire
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        
        techParticles.appendChild(particle);
      }
      
      return () => {
        if (document.body.contains(techParticles)) {
          document.body.removeChild(techParticles);
        }
      };
    };
    
    const cleanup = createParticles();
    return cleanup;
  }, [isMobile]);

  // Fonction pour gérer les clics sur les suggestions
  const handleSuggestionClick = (text) => {
    setInputMessage(text);
    // Petit délai pour s'assurer que le state est mis à jour
    setTimeout(() => handleSendMessage(), 100);
  };

  

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Root:_</h2>
        <p>Intelligence Artificielle Avancée | v2.5.0</p>
        {isError && <div className="connection-error">Problème de connexion à l'API</div>}
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
            <div className="message-content">
              <p>{message.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot-message">
            <div className="message-content typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        {/* Élément invisible utilisé pour le défilement */}
        <div ref={messagesEndRef} className="scroll-anchor" />
      </div>

      // Remplacez votre formulaire de saisie actuel par celui-ci dans Chatbot.jsx

<form className="message-input-form" onSubmit={handleSendMessage}>
  <input
    type="text"
    value={inputMessage}
    onChange={(e) => setInputMessage(e.target.value)}
    placeholder="Saisissez votre message..."
    disabled={isTyping}
    onFocus={() => isMobile && scrollToBottom()}
  />
  <button 
    type="submit" 
    disabled={isTyping || inputMessage.trim() === ''}
    className="send-button" // Ajout d'une classe pour cibler le bouton
  >
    {isMobile ? "➤" : "Envoyer"} {/* Icône plus petite sur mobile */}
  </button>
</form>

      <div className="chatbot-suggestions">
        <p>Suggestions:</p>
        <div className="suggestion-buttons">
          <button onClick={() => handleSuggestionClick("Qui es-tu ?")}>À propos de moi</button>
          <button onClick={() => handleSuggestionClick("Que peux-tu faire ?")}>Mes capacités</button>
          <button onClick={() => handleSuggestionClick("Comment fonctionnes-tu ?")}>Mon fonctionnement</button>
          <button onClick={() => handleSuggestionClick("Parle-moi de l'AGI")}>L'AGI</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;