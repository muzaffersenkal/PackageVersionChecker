import React, { Component } from 'react';

import axios from 'axios';
import Drawer from 'react-drag-drawer';
import Truncate from 'react-truncate';
import { NavLink } from 'react-router-dom';

var validator = require("email-validator");


const initialState = {
  selectedButton: null,
  inputs: [{ name: "email-0",value:"" }],
  inputCount: 1,
  selectedRepository: {
    owner:null,
    repository:null
  },
  open: false,
  popupMessage: null,
  typed: "",
  
}

class Home extends Component {

  
  state = {
    repositories: [],
    listType: 'grid',
    ...initialState
  }

  
  componentDidMount() {
    
    this.fetchDatas();
      
  };

  fetchDatas(){
    var apiUrl = null;
    if(this.state.typed == ""){
        apiUrl = "https://api.github.com/repositories";
    }else{
        apiUrl = `https://api.github.com/users/${this.state.typed}/repos`;
    }
    axios.get(apiUrl)
      .then(res => {
        
       this.setState({ repositories:res.data});
      }).catch(e => {
          console.log("Error")
      });
  }

  clickList = (event) => {
   
    this.setState({listType:event.currentTarget.id})

  }

  selectRepository = (event) => {
    
    const item = event.currentTarget;
    this.setState({
      selectedButton: item.getAttribute('data-buttonkey'),
      selectedRepository: {owner:item.getAttribute('data-owner'),repository:item.getAttribute('data-repository')},
     
    
    });

  }
  
  addInput = (event) => {
    this.setState({
      inputCount: this.state.inputCount++,
      inputs: this.state.inputs.concat([{ name: `email-${this.state.inputCount}`,value:"" }])
     
    });
    
  }
  
  search = (event) => {
    var typed = event.target.value;
    this.setState({
        typed: typed
 
      },() => {
        this.fetchDatas();
      })
    
    
  }
  
 


   checkEmail = async data => {
  
    var validated =  await true;
     await data.forEach( email => {
     
      
      if(!validator.validate(email.value)){
        

        this.setState({
          popupMessage: "Please enter a correct e-mail address.",
          open: true
          });
          validated =  false;
         
      }
     
    });

    return  validated
 
  }
    

   onSubmit=  async (event) => {
    event.preventDefault();

    if(!this.state.selectedButton) {
      this.setState({
        popupMessage: "Please select a repository! We can't notify you without selected  repository!",
        open: true
        });

       return  null;
    }
      const emailValidated = await this.checkEmail(this.state.inputs)
    

      if(emailValidated){
        const data = {
          emails: this.state.inputs,
          repository: this.state.selectedRepository
        }
         axios.post(`http://localhost:4000/notify`, { data })
          .then(res => {
            if(!res.data.success){
                this.setState({
                    popupMessage:"We couldn't any package.json or composer.json file in this repository ",
                    open: true
                   
                  });

            }else {
                this.setState({
                    popupMessage:"We sent you an email. Please check your sandbox.",
                    open: true
                   
                  });
            }
          });
        
          this.setState({
            popupMessage:"Your request is progressing now. Please Wait ...",
            open: true
           
          });

      }

     
    
    
  }

  handleChange = id => (event) => {

    const newInputs = this.state.inputs.map((input, idx) => {
      if (id !== idx) return input;
      return { ...input, value: event.target.value };
    });

      this.setState({ inputs: newInputs });
  
   
  }
  toggle = () => {
   
    
    this.setState({ ...initialState })
  }
  
  
  render() {
  
    return (
      <div className="App">


        <Drawer
  open={this.state.open}
  
  direction='left'
>
<div>

  <div className="modalText">{ this.state.popupMessage }</div>
  <button
              className="closeButton"
              onClick={this.toggle}
            >
              Close </button>
  </div>
  
</Drawer>

        <div className="sevenCol">
        <div className="wrapTop">
        <input type="text" className="searchInput" placeholder="Type username" onChange={this.search} />
        <span className="listType" id="list" onClick={this.clickList}>List</span>
        <span className="listType" id="grid" onClick={this.clickList}>Grid</span>
        </div>
        <ul  className={`atolyeList ${this.state.listType}`}>
        { this.state.repositories.map(repository => 
        <li key={repository.id} className="atolye-item">
    <img src={repository.owner.avatar_url}  width="48" height="48" />
        <span className="atolye-user list-only">
        { repository.owner.login}
        </span>
        
        <span className="atolye-name">
          { repository.name}
        </span>
        
        <span className="atolye-user grid-only">
          { repository.owner.login}
        </span>
        
        <div className="pull-right">
          
          <span className="atolye-progress">
            <span className="atolye-progress-bg">
              <span className="atolye-progress-fg" style={{width: '88%' }}></span>
            </span>
            
            <span className="atolye-progress-labels">
              <span className="atolye-progress-label">
                { repository.private ? "Private" : "Public"}
              </span>
    
              <span className="atolye-go-page">
              <NavLink to={`${repository.owner.login}/${repository.name}`} exact > More Details </NavLink>
            
              </span>
            </span>
          </span>
          
           <span className="atolye-desc grid-only">

           <Truncate lines={1} ellipsis={<span>... </span>}>
           { repository.description}
            </Truncate>
      

          
          </span>
          <span className="atolye-select-area">

          <span data-buttonkey={repository.id} data-owner={repository.owner.login} data-repository={repository.name} className={parseInt(this.state.selectedButton)===repository.id ? ' atolyeButton selectedButton' : 'atolyeButton'} onClick={this.selectRepository}>Select</span>
        
          </span>
        </div>
      </li>)}
      </ul>
     
        </div>

        <div className="threeCol">
        <div className="atolye-item">
          <h3>Get notifications</h3>

          <form className="form"  onSubmit={e => {
                        this.onSubmit(e);
                    }}>
          {this.state.inputs.map((input, id) => (
          <label key={id}>
              <input type="text" name={input.name}  value={input.value} onChange={this.handleChange(id)} placeholder="email address" required/>
              </label>

          ))}
              <button
          type="button"
          onClick={this.addInput}
          className="smallButton"
        >
          + Add more emails
        </button>
              <button className="atolyeButtonNew" type="submit">Submit</button>
          </form>
        </div>
     
        </div>
      
      </div>
    );
  }
}

export default Home;
