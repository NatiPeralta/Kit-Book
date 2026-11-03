export async function searchBookByIsbnOrQuery(query) {
  const cleanedQuery = query.trim();
  if (!cleanedQuery) return null;

  const cacheKey = `kitbook_cache_${cleanedQuery.toLowerCase()}`;
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const isIsbn = /^\d{10,13}$/.test(cleanedQuery);
  const searchQuery = isIsbn ? `isbn:${cleanedQuery}` : cleanedQuery;

  // Pega a chave do arquivo .env
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';
  const fieldsFilter = 'items(volumeInfo(title,authors,pageCount,imageLinks))';
  
  // Adiciona a chave na URL se ela existir
  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&fields=${fieldsFilter}`;
  if (apiKey) {
    url += `&key=${apiKey}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const bookInfo = data.items[0].volumeInfo;
      
      const bookResult = {
        id: Date.now() + Math.random(),
        title: bookInfo.title || cleanedQuery,
        author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Autor desconhecido',
        pages: bookInfo.pageCount || 300,
        thumbnail: bookInfo.imageLinks?.thumbnail || '',
        unread: true
      };

      localStorage.setItem(cacheKey, JSON.stringify(bookResult));
      return bookResult;
    }

    // Fallback caso o Google não encontre
    return {
      id: Date.now() + Math.random(),
      title: cleanedQuery,
      author: 'Autor desconhecido',
      pages: 300,
      thumbnail: '',
      unread: true
    };

  } catch (error) {
    console.error('Erro na requisição do Google Books:', error);
    return {
      id: Date.now() + Math.random(),
      title: cleanedQuery,
      author: 'Autor desconhecido',
      pages: 300,
      thumbnail: '',
      unread: true
    };
  }
}