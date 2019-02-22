import React, { Component } from 'react'

import axios from 'axios';
import { NavLink } from 'react-router-dom';

class List extends Component {

   
  state = {
    repository: null,
    loading: true,
    error:false,
  }


  componentDidMount() {
    axios.get(`http://localhost:4000/list/${this.props.match.params.owner}/${this.props.match.params.repository}`)
      .then(res => {
        if(res.data){
          this.setState({ repository:res.data,loading:false});
        }else{
          this.setState({ error:true,loading:false});
        }
      
      });

      
  };


  reCheck =  async (event) => {
    
    this.setState({loading:true});
    axios.get(`http://localhost:4000/recheck/${this.state.repository._id}`)
      .then(res => {
        this.setState({ repository:res.data,loading:false});
       // window.location.reload();
       
      })

  }


  render() {
    return (
         <div className="sevenCol">
        <NavLink to="/" exact className="smallButton"> Go Back </NavLink>
         <h1>{this.props.match.params.repository}    <span style={{"fontSize":"18px"}}>{this.props.match.params.owner}</span></h1> 
            <div className="atolye-item">
         
            { this.state.loading ? <div>loading...</div> : this.state.error ? <h4>We couldn't any package.json or composer.json file in this repository</h4>:

               <div>
               <a className="atolyeButton" style={{"float":"right","marginBottom":"20px"}} href={`https://github.com/${this.state.repository.owner}/${this.state.repository.repository}`}>Go to Github Page</a>
               <span className="atolyeButton selectedButton" style={{"float":"right","marginBottom":"20px"}} onClick={this.reCheck}>Re-Check </span>
        
            <table className="table">

            <thead>
              <tr>
                <th id="thName">Name</th>
                <th id="thYour">Your Version</th>
                <th id="thVersion">Latest Version</th>
                <th id="thStatus">Status</th>
              </tr>
            </thead>
            <tbody>
            { this.state.repository.packages.map(p => 
              <tr key={p.name}>
                <th>{p.name }</th>
                <td>{p.version}</td>
                <td>{p.latest_version}</td>
                <td>{p.upToDate ? "Up To Date" : "Outdated"}</td>
              </tr>
             
            ) } 
	
	
	</tbody>

</table>
</div>
          
          }
            

            </div>
         </div>
   
    )
  }
}

export default List;
