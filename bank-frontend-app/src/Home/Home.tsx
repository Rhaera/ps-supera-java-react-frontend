import appLogo from '/pocketBankLogo.png'
import './Home.css'
import AuthAccess from '../auth-access-component/AuthAccess'

const Home = () => {
  return (
    <>
        <div>
            <img src={appLogo} className="logo" alt="App logo" />
        </div>
        <h1>
            Bem Vindo Ao Banco App
        </h1>
        <p>
            Insira seu ID (NÚMERO) da sua conta:
        </p>
        <div className="card">
            <AuthAccess />
        </div>
        <p className="read-the-docs">
            <a href='https://github.com/Rhaera/ps-supera-java-react-frontend'>
                Clique Aqui Para Ser Redirecionado Ao Repo do Projeto!
            </a>
        </p>
        <p className="read-the-docs">
            <a href='https://github.com/Rhaera/ps-supera-java-react-backend'>
                Clique Aqui Para Ser Redirecionado Ao Repo da Nossa API!
            </a>
        </p>
    </>
  )
}

export default Home
