# 📚 KitBook - Gerenciador, Sorteador e Planejador de Leitura

O **KitBook** é uma aplicação web autoral e completa desenvolvida em **React** para resolver o dilema de leitores na hora de escolher o próximo livro da estante física, além de planejar cronogramas detalhados de leitura até a data final desejada.

---

## 🚀 Funcionalidades e Recursos Avançados

- 📷 **Leitor de Código de Barras (ISBN):** Utiliza a câmera do dispositivo para ler o código de barras da contracapa do livro físico ou permite a digitação manual do título/ISBN.
- 
- 🎲 **Sorteador de Leitura:** Sorteio inteligente e aleatório para definir qual será o próximo livro da fila entre os selecionados na estante.
- 
- ⚙️ **Gerenciamento Completo da Estante:** 
  - Adição, edição de títulos e ajuste de quantidade de páginas para corresponder exatamente à edição física do usuário.
  - Opções para remover livros individualmente ou limpar toda a lista.
  - 
- 📅 **Planejador de Cronograma Inteligente:** 
  - Definição da data de início e término da leitura.
  - Escolha entre divisão por **páginas** ou **capítulos**.
  - Cálculo automático e preciso de quanto o usuário precisa ler por dia/período para concluir a meta na data prevista.
  - 
- 💾 **Persistência com LocalStorage:** Todas as etapas e cronogramas gerados são salvos localmente para que o usuário possa fechar o navegador e retornar a qualquer momento sem perder o progresso.

---

## 🛠️ Tecnologias Utilizadas

- **[React](https://react.dev/):** Componentização avançada, gerenciamento de estado (`useState`) e efeitos colaterais (`useEffect`).
- **[JavaScript (ES6+)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript):** Lógica de datas, cálculos matemáticos para o cronograma, manipulação de arrays e consumo assíncrono de APIs.
- **[CSS3](https://developer.mozilla.org/pt-BR/docs/Web/CSS):** Estilização modular, Flexbox/Grid e layout responsivo e acolhedor para leitores.
- **[Web APIs (Barcode/Câmera & LocalStorage):** Integração com recursos nativos do navegador para leitura de códigos e salvamento de estado.
- **[Vite](https://vitejs.dev/):** Build tool de alta performance.
- **[Git & GitHub](https://github.com/):** Versionamento do código.

---

## 🔧 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js instalado (versão 18 ou superior)
- Gerenciador de pacotes `npm` ou `yarn`

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/NatiPeralta/kitbook.git](https://github.com/NatiPeralta/kitbook.git)

2. **Acesse a pasta do projeto:**
   ```bash
   cd kitbook

3. **Instale as dependências:**
   ```bash
   npm install

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev

5. Abra o navegador no endereço exibido no terminal (geralmente: http//localhost:5173)

👩‍💻 Autora

Nati Peralta
Desenvolvedora Front-end

    GitHub: @NatiPeralta

    LinkedIn: Nati Peralta (www.linkedin.com/in/natália-peralta)
