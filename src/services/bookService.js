export async function searchBookByIsbnOrQuery(query) {
  try {
    const cleanedQuery = query.trim();
    // Usando a API de busca pública da Open Library
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanedQuery)}&limit=1`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      // Fallback amigável caso não ache na Open Library
      return {
        id: Date.now() + Math.random(),
        title: cleanedQuery,
        author: 'Autor desconhecido',
        pages: 300,
        thumbnail: '',
        unread: true
      };
    }

    const bookInfo = data.docs[0];
    
    // A Open Library retorna o ID da capa (cover_i), que podemos transformar na URL oficial da imagem
    const coverId = bookInfo.cover_i;
    const thumbnail = coverId 
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` 
      : '';

    return {
      id: Date.now() + Math.random(),
      title: bookInfo.title || cleanedQuery,
      author: bookInfo.author_name ? bookInfo.author_name.join(', ') : 'Autor desconhecido',
      pages: bookInfo.number_of_pages_median || 300,
      thumbnail: thumbnail,
      unread: true
    };

  } catch (error) {
    console.error('Erro na requisição Open Library:', error);
    return {
      id: Date.now() + Math.random(),
      title: query.trim(),
      author: 'Autor desconhecido',
      pages: 300,
      thumbnail: '',
      unread: true
    };
  }
}