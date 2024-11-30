import andresGaitan from "../images/technicians/andresGaitan.jpeg";
import burhanUresin from "../images/technicians/burhanUresin.jpeg";
import cemaliSonisik from "../images/technicians/cemaliSonisik.jpeg";
import emilioDeJesus from "../images/technicians/emilioDeJesus.jpeg";
import emreAlipek from "../images/technicians/emreAlipek.jpeg";
import ensarUyanik from "../images/technicians/ensarUyanik.jpeg";
import erickGamarra from "../images/technicians/erickGamarra.jpeg";
import euripidesRojas from "../images/technicians/euripidesRojas.jpeg";
import felixNunez from "../images/technicians/felixNunez.jpeg";
import gurkanKaraman from "../images/technicians/gurkanKaraman.jpg";
import hectorFerreras from "../images/technicians/hectorFerreras.jpeg";
import johnsonArango from "../images/technicians/johnsonArango.jpeg";
import joseAldana from "../images/technicians/joseAldana.jpeg";
import joseDeJesus from "../images/technicians/joseDeJesus.jpeg";
import joseValdez from "../images/technicians/joseValdez.jpeg";
import juanUrena from "../images/technicians/juanUrena.jpeg";
import kelvinAlmonte from "../images/technicians/kelvinAlmonte.jpeg";
import luisGonzales from "../images/technicians/luisGonzales.jpeg";
import luisRubio from "../images/technicians/luisRubio.jpeg";
import muhammedOzturk from "../images/technicians/muhammedOzturk.jpeg";
import recepCelik from "../images/technicians/recepCelik.jpeg";
import tanerYavuz from "../images/technicians/tanerYavuz.jpeg";
import victorCuevas from "../images/technicians/victorCuevas.jpeg";
import yilmazGunes from "../images/technicians/yilmazGunes.jpeg";
import duncanMould from "../images/technicians/duncanMould.jpeg";
import sedaGirgin from "../images/technicians/sedaGirgin.jpeg";

export const getUserImage = (username) => {
  switch (username) {
    case "gurkan@cibovita.com":
      return gurkanKaraman;
    case "burhan@cibovita.com":
      return burhanUresin;
    case "andres@cibovita.com":
      return andresGaitan;
    case "pedro@cibovita.com":
      return felixNunez;
    case "cemali@cibovita.com":
      return cemaliSonisik;
    case "ensar@cibovita.com":
      return ensarUyanik;
    case "duncan@cibovita.com":
      return duncanMould;
    case "seda@cibovita.com":
      return sedaGirgin;
    case "yunusemre@cibovita.com":
      return emreAlipek;
    case "muhammedozturk":
      return muhammedOzturk;
    case "josealdana":
      return joseAldana;
    case "kelvinalmonte":
      return kelvinAlmonte;
    case "victorcuevas":
      return victorCuevas;
    case "yilmazgunes":
      return yilmazGunes;
    case "recepcelik":
      return recepCelik;
    case "josedejesus":
      return joseDeJesus;
    case "taneryavuz":
      return tanerYavuz;
    case "johnarango":
      return johnsonArango;
    case "erickgamarra":
      return erickGamarra;
    case "juancarlosurena":
      return juanUrena;
    case "emiliodejesus":
      return emilioDeJesus;
    case "manuelvaldez":
      return joseValdez;
    case "euripidesjavier":
      return euripidesRojas;
    case "alexrubio":
      return luisRubio;
    case "alfredogonzales":
      return luisGonzales;
    case "hectorperez":
      return hectorFerreras;
    default:
      return "";
  }
};
