import React, { Component } from 'react';
import './App.css';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';



/*-----------PAGES---------*/
import Inventory from './pages/inventory/Inventory';
import Publicity from './pages/publicity/Publicity';
import Stats from './pages/stats/Stats';
import Order from './pages/order/Order';
import Add from './pages/addProduct/AddProduct';
import Car from './pages/car/Car';

/*----COMPONENTS---------*/
import Navtop from './components/navigation/navtop/Navtop';
import Navbar from './components/navigation/navbar/Navbar';

import {connect} from 'react-redux'

class App extends Component {
  render() {
    return (


        <div className={`app  ${this.props.showFullNavbar === true ? '' : 'full-app'}`}>
                  <Navtop />
                  <Navbar />

              
                  
                  <Switch>
                      <Route path='/' exact component={Inventory}/>
                      <Route path='/ajouter' component={Add}/>

                      <Route exact path='/car/:prodId' component={Car}/>

                      {
                        /*
                        
                        

                        <Route path='/publicity' component={Publicity}/>
                        
                        <Route path='/stats' component={Stats}/>
                        <Route path='/commandes' component={Order}/> 
                        */
                      }
                                                       
                  </Switch>
                  
                  
               
            </div>

      
    );
  }
}

const mapStateToProps = state => {
  return {
    showFullNavbar: state.nav.showFullNavbar

  }
}

export default connect(mapStateToProps)(App);
