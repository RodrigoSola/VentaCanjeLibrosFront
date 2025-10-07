import { useCallback, useState } from 'react';

function useFetchBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const initialUrl = 'http://localhost:3000/api/books/get';

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setDone(false);
    try {
      const response = await fetch(initialUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error:', errorResponse);
        throw new Error(`Error: ${response.status} - ${errorResponse.message || 'Failed to fetch'}`);
      }
      const data = await response.json();
      setBooks(data || []);
      setDone(true);
      return data;
    } catch (err) {
      setError(err.message);
      setBooks([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setDone(false);
    fetchBooks();
  }, [fetchBooks]);

  const addBook = useCallback((newBook) => {
    setBooks((prev) => [...prev, newBook]);
  }, []);

  const removeBook = useCallback((bookId) => {
    setBooks((prev) => prev.filter((book) => book._id !== bookId));
  }, []);

  return { books, setBooks, refetch, removeBook, addBook, fetchBooks, isLoading, error, done };
}

export default useFetchBooks;