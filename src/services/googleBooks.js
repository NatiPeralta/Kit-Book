export async function searchBookByIsbnOrQuery(query) {
  const cleanedQuery = query.trim();
  if (!cleanedQuery) return null;

  const cacheKey = `kitbook_cache_${cleanedQuery.toLowerCase()}`;
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const isIsbn = /^\d{10,13}$/.test(cleanedQuery);
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';

  try {
    let items = [];
    let titleFallback = cleanedQuery;
    let authorFallback = 'Autor desconhecido';

    // 1. Se for ISBN, tenta buscar pelo código específico
    if (isIsbn) {
      let isbnUrl = `https://googleapis.com{cleanedQuery}`;
      if (apiKey) isbnUrl += `&key=${apiKey}`;
      
      const res = await fetch(isbnUrl);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        items = data.items;
        // Guarda o título e autor encontrados pelo ISBN para o caso de precisar da busca geral
        titleFallback = items[0].volumeInfo?.title || titleFallback;
        authorFallback = items[0].volumeInfo?.authors ? items[0].volumeInfo.authors.join(', ') : authorFallback;
      }
    }

    // 2. CORREÇÃO CRÍTICA: Se não for ISBN, ou se a busca por ISBN não trouxe resultados,
    // OU se o resultado do ISBN veio sem capa ou sem páginas, fazemos a busca textual ampla.
    const hasValidItem = items.length > 0 && items[0].volumeInfo?.imageLinks?.thumbnail && items[0].volumeInfo?.pageCount;

    if (!hasValidItem) {
      // Se viemos do ISBN, pesquisamos pelo Título + Autor para achar uma edição mais completa
      let cleanTitle = titleFallback.split(':')[0].split('-')[0].trim();
      
      const searchQuery = `intitle:${cleanTitle}`;
      
      let generalUrl = `https://googleapis.com{encodeURIComponent(searchQuery)}&maxResults=10`;
      if (apiKey) generalUrl += `&key=${apiKey}`;

      const res = await fetch(generalUrl);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        items = data.items; // Substitui pelos resultados mais amplos
      }
    } else {
      // Se falhar com intitle:, tenta a busca textual ultra ampla igual ao input manual puro
      let broadUrl = `https://googleapis.com{encodeURIComponent(cleanTitle)}&maxResults=10`;
      if (apiKey) broadUrl += `&key=${apiKey}`;
      const broadRes = await fetch(broadUrl);
      const broadData = await broadRes.json();
      if (broadData.items) items = broadData.items;
    }

    if (items.length > 0) {
      // Procura o item mais completo (que tenha capa e páginas) entre os resultados disponíveis
      let bestItem = items[0];
      for (let item of items) {
        if (item.volumeInfo?.imageLinks?.thumbnail && item.volumeInfo?.pageCount) {
          bestItem = item;
          break;
        }
      }

      const bookInfo = bestItem.volumeInfo;
      
      let thumbnail = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || '';
      if (thumbnail.startsWith('http:')) {
        thumbnail = thumbnail.replace('http:', 'https:');
      }

      const bookResult = {
        id: Date.now() + Math.random(),
        title: bookInfo.title || titleFallback,
        author: bookInfo.authors ? bookInfo.authors.join(', ') : authorFallback,
        pages: bookInfo.pageCount || 300,
        thumbnail: thumbnail,
        unread: true
      };

      localStorage.setItem(cacheKey, JSON.stringify(bookResult));
      return bookResult;
    }

    // Fallback absoluto
    return {
      id: Date.now() + Math.random(),
      title: titleFallback,
      author: authorFallback,
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
