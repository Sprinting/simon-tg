let round_interval_id = ''
let not_clicked_timeout= ''
let processing=[false,false]
let colors =()=> {
  return {
  0:'r',1:'b',2:'g',3:'y'
  }
}

let board = ()=>{
  let _colors = colors()
  return {
    simon:{
    0:document.querySelector("[data-color='"+_colors[0]+"']"),
    1:document.querySelector("[data-color='"+_colors[1]+"']"),
    2:document.querySelector("[data-color='"+_colors[2]+"']"),
    3:document.querySelector("[data-color='"+_colors[3]+"']"),
    },
    controls:{
      on_off:document.querySelector("button._on_off"),
      start:document.querySelector("button._start"),
      strict:document.querySelector("button._strict")
    },
    display:document.querySelector("div.display"),
    all:document.querySelectorAll("[data-color]"),
    sound:{
      0:document.querySelector('audio#r'),
      1:document.querySelector('audio#b'),
      2:document.querySelector('audio#g'),
      3:document.querySelector('audio#y')
    }
  }

}

let play_audio = (game,which)=>{
  console.log(colors()[which],'sound')
  game.board.sound[which].play()
}

let states = ()=>{
  return {
  inactive:0,
  active:1,
  playing:2,
  waiting:3,
  complete:4,
  failed:5
    }
}

let get_random_sequence = (length)=>{
  let valid = [0,1,2,3]
  let sequence = []
 for(let i=0;i<length;i++)
  {
    sequence.push(valid[Math.floor(Math.random()*valid.length)])
  }
  return sequence
}

let update_state = (old_state,new_state,clear_first=false)=>
{
  if(clear_first)
  {
    //console.log("resetting old_state")
    old_state={
    }
  }
  for(let key in new_state)
  {
    if(new_state.hasOwnProperty(key))
      old_state[key]=new_state[key] 
  }
  return old_state
}

let update_and_notify = (game,new_state)=>{
  game.state=update_state(game.state,new_state)
  notify_state_changed(game)
}

let notify_state_changed= (game)=>{
  switch(game.state.state){
    case game.states.inactive:
     
      game.board.controls.strict.disabled=true
      game.board.controls.start.disabled=true
      game.board.controls.on_off.dataset.button=0
      game.round="- -"
      game.board.display.dataset.round=game.round
      game.board.display.classList.remove("active")
      update_game_ui(game)
      break;
    case game.states.active:
      game.current_check=0
      game.board.controls.strict.disabled=false
      game.board.controls.start.disabled=false
      game.board.controls.on_off.dataset.button=1
      game.round=1
      game.board.display.dataset.round=game.round
      game.board.display.classList.add("active")
      update_game_ui(game)
      break;
    case game.states.playing:
      game.board.display.dataset.round =game.round
      if(game.round>=20){
        update_and_notify(game,{state:game.states.inactive})
        alert("You Won")
      }
      else {
       // console.log("starting another round")
        start_round(game)
      }
      update_game_ui(game)
      for(let i=0;i<game.board.all.length;i++)
        game.board.all[i].classList.add("clickable")
      break;
    case game.states.waiting:
      wait_for_player(game)
 }
}

let start_round = (game)=>{
  processing[0] = true
  console.log(game.sequence,'before_assigning')
  if(game.play_prev)
  {
    game.sequence = game.sequence
    game.play_prev=false;
  }
  else
  {
  let _sequence = get_random_sequence(game.round)
  // game.round = game.round+1
  game.sequence=_sequence
  } 
  console.log(game.sequence,game.round)
  console.log(game.sequence,'just_above')
  play_through_sequence(game)
  update_and_notify(game,{state:game.states.waiting})
  return game.sequence
}

let wait_for_player = (game)=>{
  // console.log('waiting',game.state.state,game.sequence)
  // console.log('required',game.sequence,'player',game.current_sequence)
}

let listen_to_player_response=(game)=>{
  
  clearTimeout(not_clicked_timeout)
  console.log('checking',game.sequence,'for round',game.round)
  console.log('player',game.current_sequence)
  console.log('required',game.sequence[game.current_check],'player',game.current_sequence[game.current_check])
  if(game.sequence[game.current_check]!=game.current_sequence[game.current_check])
  {
    if(game.strict)
    {
      game.round=1
      game.current_sequence =[]
      game.current_check=0
      update_and_notify(game,{state:game.states.playing})
    }
    else
    {
      game.current_sequence =[]
      game.current_check=0
      game.play_prev=true
      update_and_notify(game,{state:game.states.playing})
    }
  }
  else{
    if(game.current_sequence.length==game.round)
    {
      game.round = game.round+1
      game.current_sequence =[]
      game.current_check=0
      console.log('proceed to next round',game.current_check)
      update_and_notify(game,{state:game.states.playing})
    }
    else {
      game.current_check=game.current_check+1
      console.log('updated for next check',game.current_check)
    }
  }
  processing[1]=false;
}

let update_game_ui =(game)=>{
  if(game.state.state==game.states.inactive)
  {
    console.log('inactive')
    game.board.controls.on_off.firstChild.textContent="OFF"
  }
  else if(game.state.state==game.states.active)
  {
    game.board.controls.on_off.firstChild.textContent="ON"
  }
   if(typeof(game.round)=="number")
   {
    if(game.round<10)
      game.board.display.firstChild.textContent="0"+game.board.display.dataset.round
     else game.board.display.firstChild.textContent=game.board.display.dataset.round
   }
   else game.board.display.firstChild.textContent=game.board.display.dataset.round
}

let play_through_sequence = (game)=>{
  let current_idx=0
  round_interval_id = setInterval(()=>{
    //console.log('yoyo',game)
    if(current_idx>game.sequence.length-1)
    {
      clearInterval(round_interval_id)
      processing[0]=false;
    }
    else{
        console.log("playing",colors()[game.sequence[current_idx]])
        play_audio(game,game.sequence[current_idx])
        game.board.simon[game.sequence[current_idx]].classList.add("active")
        setTimeout(()=>{
          game.board.simon[game.sequence[current_idx]].classList.remove("active")
          current_idx++;
        },500)
    }
  },1000)
}


let set_up = ()=>{
  let _board = board()
  let _round = "- -"
  let _states = states()
  let _state = {state:_states.inactive}
  return {
    board:_board,
    round:_round,
    states:_states,
    state:_state,
    strict:Number(_board.controls.strict.dataset.button),
    sequence:[],
    current_sequence:[],
    current_check:0,
    play_prev:false
  }
}

let reset = (game)=>{
  game.play_prev=false
  processing[0]=false
  processing[1]=false
  game.round=1
  game.current_check=0
  game.sequence = []
  game.current_sequence = []
  update_and_notify(game,{state:game.states.inactive})
  game.strict=Number(game.board.controls.strict.dataset.button)
}

let init_game =() => {
  let game= set_up()
  console.log('init')
  game.board.controls.on_off.addEventListener('click',()=>{
    if(game.state.state==game.states.inactive)
    {
      update_and_notify(game,{state:game.states.active})
    }
    else
    {
      update_and_notify(game,{state:game.states.inactive})
      clearTimeout(not_clicked_timeout)
    }
  },false)
  
  game.board.controls.start.addEventListener('click',()=>{
    game.round=1
    update_and_notify(game,{state:game.states.playing})
  },false)
  
  game.board.controls.strict.addEventListener('click',()=>{
    if(Number(game.board.controls.strict.dataset.button)==0)
    {
      game.board.controls.strict.dataset.button=1
      game.board.controls.strict.firstChild.textContent="Strict"
    }
    else{
      game.board.controls.strict.dataset.button=0
      game.board.controls.strict.firstChild.textContent="Easy"
    }
    reset(game)
  },false)
  
  for(let i=0;i<Object.keys(game.board.simon).length;i++)
  {
    
    console.log('attaching event listener to',game.board.simon[i])
    game.board.simon[i].addEventListener('click',()=>{
      if(game.state.state!=game.states.waiting || processing[0]||processing[1])
      {
         
      }
      else
      {
        processing[1]=true
        clearTimeout(not_clicked_timeout)
        game.current_sequence.push(i)
        play_audio(game,i)
        listen_to_player_response(game)
      }
      
    },false)
  }
  
  update_game_ui(game)
  console.log(game)
  return game
}

let _game=init_game()