import { useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries/users';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_ME);

if(!user) {
    navigate('/login');
    }

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  const userData = data?.me;

  return (
    <div className="profile-container">
      <h2>Profil</h2>
      <div className="profile-info">
        <p><strong>Nom d'utilisateur :</strong> {userData.username}</p>
        <p><strong>Email :</strong> {userData.email}</p>
        {/* <p><strong>ID :</strong> {userData.id}</p> */}
      </div>
      <button className="profile-button" onClick={() => { logout(); navigate('/login'); }}>
        Se déconnecter
      </button>
    </div>
  );
};

export default Profile;
