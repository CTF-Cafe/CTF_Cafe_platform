import ctfCafeLogo from "../img/logo.png";

function TradeMark() {
  return (
    <div className="tradeMark">
      <a href="https://github.com/CTF-Cafe/CTF_Cafe" target="_blank">
        <img classname="trademarkSticker" src={ctfCafeLogo} />
      </a>
    </div>
  );
}

export default TradeMark;