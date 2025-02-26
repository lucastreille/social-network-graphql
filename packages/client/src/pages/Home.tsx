import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../graphql/queries/posts';
import '../styles/Home.css';

const Home = () => {
  const { data, loading, error } = useQuery(GET_POSTS);

  console.log("Réponse du serveur :", data);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div>
      
    </div>
  );
};

export default Home;
