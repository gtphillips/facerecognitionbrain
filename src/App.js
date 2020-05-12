import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';

const particleOptions = {
	particles: {
		number: {
			value: 80,
			density: {
				enable: true,
				value_area: 800
			}
		}
	}
}

const initialState = {
  input: '',
  imageUrl: '',
  boxList: [],
  route: 'signIn',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
  	super();
  	this.state = {
  		input: '',
  		imageUrl: '',
      boxList: [],
      route: 'signIn',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
  	}
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
  	const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  	const image = document.getElementById('inputImage');
  	const width = Number(image.width);
  	const height = Number(image.height);
  	return {
  		leftCol: clarifaiFace.left_col * width,
  		topRow: clarifaiFace.top_row * height,
  		rightCol: width - (clarifaiFace.right_col * width),
  		bottomRow: height - (clarifaiFace.bottom_row * height)
     }
}

  calculateFaceLocationMulti = (data) => {
    //array to return face boxes
    let boxList = [];

    //grab regions from api call
    let faceRegions = data.outputs[0].data.regions;
    
    //get image dimensions to position boxes
    let image = document.getElementById('inputImage');
    let width = Number(image.width);
    let height = Number(image.height);

    //for each face, return an object with 4 points in boxList
    faceRegions.map(face => {
       let boxInfo = face.region_info.bounding_box;
       let newBox = {
        leftCol: boxInfo.left_col * width,
        topRow: boxInfo.top_row * height,
        rightCol: width - (boxInfo.right_col * width),
        bottomRow: height - (boxInfo.bottom_row * height)        
      };
      boxList.push(newBox);
      return(newBox);
    });
    //returns an array of the bounding boxes to be drawn in FaceRecognition.js
    return boxList;
  }

  displayFaceBox = (boxList) => {
    this.setState({boxList: boxList});
  }

  onInputChange = (event) => {
  	this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
  	this.setState({imageUrl: this.state.input});
  	fetch('https://still-cove-70158.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
  	.then(response => {
      if (response) {
        fetch('https://still-cove-70158.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
      })
      .catch(console.log);
      }
      this.displayFaceBox(this.calculateFaceLocationMulti(response));
	  })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signOut') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, boxList } = this.state;
	  	return (
	    <div className="App">
	    	 <Particles className='particles'
	          params={particleOptions} 
	  			/>
	      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' ?
         <div> 
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition boxList={boxList} imageUrl={imageUrl}/>
         </div>
        : (
            route === 'signIn' ?
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
	  );
  }
}

export default App;
