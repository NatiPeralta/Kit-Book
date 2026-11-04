
export async function searchBookByIsbnOrQuery(query) {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) return null;

  // Remove espaços e hífens do ISBN
  const normalizedQuery = cleanedQuery.replace(/[\s-]/g, "");

  const isIsbn = /^\d{10}(\d|X)$/i.test(normalizedQuery) ||
                 /^\d{13}$/.test(normalizedQuery);

  // Nova versão do cache para evitar reutilizar resultados antigos
  const cacheKey = `kitbook_cache_v2_${cleanedQuery.toLowerCase()}`;

  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || "";

  // Função responsável por consultar a API
  async function fetchBooks(searchTerm) {
    const params = new URLSearchParams({
      q: searchTerm,
      maxResults: "10",
      projection: "full"
    });

    if (apiKey) {
      params.append("key", apiKey);
    }

    const url = `https://www.googleapis.com/books/v1/volumes?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();

    return data.items || [];
  }

  // Calcula a quantidade de informações disponíveis
  function getCompleteness(item) {
    const info = item.volumeInfo || {};

    let score = 0;

    if (info.title) score += 1;
    if (info.authors?.length) score += 2;
    if (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail) {
      score += 3;
    }
    if (info.pageCount) score += 3;

    return score;
  }

  try {
    let isbnResults = [];
    let searchResults = [];

    // 1. Busca pelo ISBN ou pelo texto digitado
    if (isIsbn) {
      isbnResults = await fetchBooks(`isbn:${normalizedQuery}`);
    } else {
      searchResults = await fetchBooks(cleanedQuery);
    }

    // 2. Identifica o melhor resultado da primeira busca
    const firstResults = isIsbn ? isbnResults : searchResults;

    let bestItem = firstResults.sort(
      (a, b) => getCompleteness(b) - getCompleteness(a)
    )[0];

    // 3. Se faltarem informações, realiza uma busca complementar
    const currentInfo = bestItem?.volumeInfo || {};

    const needsFallback =
      !bestItem ||
      !currentInfo.imageLinks ||
      !currentInfo.pageCount;

    if (isIsbn && needsFallback) {
      const title = currentInfo.title || "";
      const author = currentInfo.authors?.join(" ") || "";

      // Aproveita o título e o autor encontrados pelo ISBN
      const fallbackQuery = title
        ? `intitle:${title} ${author ? `inauthor:${author}` : ""}`
        : normalizedQuery;

      searchResults = await fetchBooks(fallbackQuery);
    }

    // 4. Seleciona o resultado mais completo entre as buscas
    const allResults = [...firstResults, ...searchResults];

    if (allResults.length === 0) {
      console.warn("Nenhum livro encontrado:", cleanedQuery);
      return null;
    }

    allResults.sort(
      (a, b) => getCompleteness(b) - getCompleteness(a)
    );

    // Prioriza o resultado que possui mais metadados
    bestItem = allResults[0];

    // 5. Combina os dados para aproveitar informações das duas buscas
    const primaryInfo = bestItem.volumeInfo || {};
    const secondaryInfo =
      allResults.find(
        item =>
          item !== bestItem &&
          item.volumeInfo?.imageLinks &&
          item.volumeInfo?.pageCount
      )?.volumeInfo || {};

    const thumbnail =
      primaryInfo.imageLinks?.thumbnail ||
      primaryInfo.imageLinks?.smallThumbnail ||
      secondaryInfo.imageLinks?.thumbnail ||
      secondaryInfo.imageLinks?.smallThumbnail ||
      "";

    const bookResult = {
      id: Date.now() + Math.random(),

      title:
        primaryInfo.title ||
        secondaryInfo.title ||
        cleanedQuery,

      author:
        primaryInfo.authors?.join(", ") ||
        secondaryInfo.authors?.join(", ") ||
        "Autor desconhecido",

      // Não inventa a quantidade de páginas
      pages:
        primaryInfo.pageCount ||
        secondaryInfo.pageCount ||
        null,

      thumbnail: thumbnail.replace(/^http:/, "https:"),

      unread: true
    };

    // 6. Salva o resultado no cache
    localStorage.setItem(
      cacheKey,
      JSON.stringify(bookResult)
    );

    return bookResult;

  } catch (error) {
    console.error("Erro na busca de livros:", error);
    return null;
  }
}
