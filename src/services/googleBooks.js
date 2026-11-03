export async function searchBookByIsbnOrQuery(query) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const bookInfo = data.items[0].volumeInfo;

    return {
      id: Date.now(),
      title: bookInfo.title || 'Título desconhecido',
      author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Autor desconhecido',
      pages: bookInfo.pageCount || 300,
      thumbnail: bookInfo.imageLinks?.thumbnail || '',
      unread: true
    };
  } catch (error) {
    console.error('Erro ao buscar livro na API do Google Books:', error);
    return null;
  }
}