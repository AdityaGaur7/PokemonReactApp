import React, { useEffect, useState } from 'react'
// import img2 from './img/ok.jpg'
import axios from 'axios';
function Nine() {
    const [pkmn,setpkmn]= useState();
    const [axa,setaxa]=useState();
 const [photo,setphoto]=useState();
 const [id,setid]=useState();

//    const [again,setagain]=useState();
  

useEffect(()=>{
  // alert('hi');
  async function getdata(){
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${axa}`);
      // console.log(res.data.sprites.other.home.front_default); 
      // console.log(res.data.id);
      console.log(res);
      if(res.status!=200)alert('not')
      let id =  res.data.id +'.';
      setid(id)
      setaxa(res.data.name);
  setphoto(res.data.sprites.other.home.front_default);
    } catch (error) {
      console.log("ERROR");
      setid('');
      setaxa('Not found its Pichu 😆');
      setphoto('img/Error404.gif')
    }
     
  
  }
 
getdata();

},[axa]
)

    const srch =(e)=>{
       let inform = (e.target.value).toLowerCase();
       
        setpkmn(inform);

    }
    const setkaro=()=>{
        setaxa(pkmn);
        setpkmn('');
    //   setagain(photo);

    }
 
  
   
  return (
   
    <div className='poora'>
      <div className='logo'>
      {/* <h1>Search</h1> */}
      <img src="img/logo.png" alt="" />
      </div>
      <input type="text" onChange={srch} value={pkmn} placeholder='Pokemon name / ID'/>
      <button onClick={setkaro}>search</button>
      <div className='info' style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
      <h2>{id} </h2>
      <h2> {axa}</h2>
      </div>
      <img className='pkmnimg' src={photo} alt="" />
    </div>
  )
}

export default Nine
