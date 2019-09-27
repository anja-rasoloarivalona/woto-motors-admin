import React, { Component } from "react";
import "./AddProduct.css";
import uuid from 'uuid/v4';
import { formGeneral } from "./forms/formGeneral";
import { formTech } from "./forms/formTech";
import { formDesign } from "./forms/formDesign";
import FormFeature from './forms/formFeature/FormFeature';
import Filepicker from './forms/filePicker/FilePicker';
import { storage } from "../../firebase";
import Input from "../../components/formInput/FormInput";
import Button from '../../components/button/Button';
import { connect } from 'react-redux'


class AddProduct extends Component {
  state = {
    images: [],
    urlImages: [],
    albumId: '',

    /*We need all inputs in one array to send the date easiliy */
    fullForm: formGeneral.concat(formTech, formDesign),
    /*We need to store each array into an array to develop the UI easily */
    fullFormPart: [formGeneral, formTech, formDesign],
    
    featuresList: [],
    featureBeingAdded: '',
    showImage: false,

    editingMode: false,


    productBeingEdited: {},
    productBeingEditedID: '',
    productBeingEditedCurrentUrlImages: [], 
    newFullForm: {},


    productBeingEditedCurrentUrlImagesWithChekedOption: [],
    selectedImages: [],
    cancelImageDeletingAllowed: false

  }; 

  componentDidMount() {

    let product = Object.keys(this.props.productBeingEdited);

   if(product.length === 0){
        return console.log('new')
    } 

    console.log('updating');

    console.log(this.props.productBeingEdited)

   
    let prod = this.props.productBeingEdited;
    let general = prod.general[0]
    let tech = prod.tech[0]
    let design = prod.design[0]
    let newFullForm = {...general, ...tech, ...design};


    let productBeingEditedCurrentUrlImagesWithChekedOption = [];
    
    this.props.productBeingEdited.imageUrls.forEach( url => {
      productBeingEditedCurrentUrlImagesWithChekedOption = [...productBeingEditedCurrentUrlImagesWithChekedOption, {url: url, checked: false}]
    })

    this.setState({
      editingMode: true,
      featuresList: this.props.productBeingEdited.features,
      newFullForm: newFullForm,
      albumId: this.props.productBeingEdited.albumId,
      productBeingEditedCurrentUrlImages: this.props.productBeingEdited.imageUrls,
      productBeingEditedID: this.props.productBeingEdited._id,


      productBeingEditedCurrentUrlImagesWithChekedOption: productBeingEditedCurrentUrlImagesWithChekedOption
    })

 
  }

  inputChangeHandler = (input, value) => {

    const { fullForm, newFullForm } = this.state;

    if(this.state.editingMode === false) {
      const indexInput = fullForm.findIndex(i => i.id === input);
      let newForm = fullForm;
      newForm[indexInput].value = value;
      this.setState({
        fullForm: newForm
        });
    }

    if(this.state.editingMode === true){
      let upDatedNewFullForm = newFullForm;
      upDatedNewFullForm[input] = value
      this.setState({
        newFullForm: upDatedNewFullForm
      })
    }
  };

  senData = () => {

    const { fullForm, featuresList, urlImages, newFullForm } = this.state;

    console.log("fetch going....");

    const formData = new FormData();

    let method;
    let url;


    if(this.state.editingMode === false){
        fullForm.map(i => formData.append(`${i.id}`, `${i.value}`));
        formData.append('features', featuresList);
        formData.append('imageUrls', urlImages);
        formData.append('albumId', this.state.albumId);

        method = 'POST';
        url = "http://localhost:8000/admin/add-product";
    }

    if(this.state.editingMode === true){

      let productBeingEditedUrlImages = [];
          
      if(this.state.images.length !== 0){
        productBeingEditedUrlImages = [...this.state.productBeingEditedCurrentUrlImages, ...this.state.urlImages]
      } else {
        productBeingEditedUrlImages = this.state.productBeingEditedCurrentUrlImages
      }

        for(let i in newFullForm){
          formData.append(`${i}`, `${newFullForm[i]}`)
        };
        formData.append('features', featuresList);
        formData.append('albumId', this.state.albumId);
        formData.append('imageUrls', productBeingEditedUrlImages);
        formData.append('productBeingEditedID', this.state.productBeingEditedID )
        method = 'PUT';
        url = "http://localhost:8000/admin/edit-product"
    }

    fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      method: method,
      body: JSON.stringify(Object.fromEntries(formData))
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating a product failed");
        }

        return res.json()
      })
      .then(resData => {
        console.log(resData);
      })
      .catch(err => {
        console.log(err);
      });
  };

  uploadHandler = async e => {
    e.preventDefault();

    const { images } = this.state;

    let albumId;

    if(this.state.editingMode === true){
      albumId = this.state.albumId
    } else {
      albumId = uuid()
      this.setState({ albumId: albumId})
    }

    if(this.state.images.length !== 0){

      try {
        const urls = await Promise.all( images.map(image => 
            new Promise((resolve, reject) => {
                const uploadTask = storage.ref(`${albumId}/${image.name}`).put(image);
                uploadTask.on('state_changed', 
                (snapshot) => {
                    // progress function....
                },          
                reject,                   
                () => {
                    //complete function...
    
                    storage.ref(`${albumId}`).child(image.name)
                        .getDownloadURL()
                        .then(url => {
                            let imgStored = this.state.urlImages;              
                            imgStored.push(url);

                            this.setState({
                                urlImages: imgStored
                            }, () => console.log(this.state.urlImages))
                            resolve(url)
                        })
                })
            })
        ))
        this.senData();
        return urls;
      }
      catch (err){
          console.log(err)
      }   
    } 
    
    /*------NO IMAGES TO SEND TO FIREBASE-------*/
    
    else {
        this.senData();
    }  
    
    

  };

  filesHandler = files => {
    let images = [];
    files.forEach(file => {
      let a = file.file;
      images = [...images, a];
    });
    this.setState({
      images: images
    });
  };

  showImageFormHandler = e => {
      e.preventDefault();
      window.scrollTo(0, 0);
    if(this.state.showImage === false){
        this.setState({showImage: true});
    }  
  }

  hideImageFormHandler = e => {
     e.preventDefault();
     window.scrollTo(0, 0);
      if(this.state.showImage === true){
        this.setState({showImage: false});
      }
    
  }


  addFeatureChangeHandler = (input, value) => {
        this.setState({featureBeingAdded: value})
  }

  addFeature = e => {
      e.preventDefault();
      const {featureBeingAdded, featuresList} = this.state;
      let newList = [...featuresList, featureBeingAdded];
      this.setState({featuresList: newList})
  }

  deleteFeature = i => {
      let {featuresList} = this.state;
      let newList = featuresList.filter(el => el !== i);
      this.setState({featuresList: newList})
  }

  over = e => {
    e.preventDefault()
    console.log('new full form', this.state.newFullForm)
  }

  selectDeleteHandler = urlSelected => {

    const  data  = this.state.productBeingEditedCurrentUrlImagesWithChekedOption;

    let selectedImages = this.state.selectedImages;

    if(selectedImages.length !== 0){

        if(selectedImages.includes(urlSelected)){
            selectedImages = selectedImages.filter(i => i !== urlSelected)
        } else {
            selectedImages = [...selectedImages, urlSelected]
        }

    } else {
      selectedImages = [...selectedImages, urlSelected]
    }

    // New data with checked key updated for the UI
    let newData = [];

    data.forEach( i => {

        if(i.url === urlSelected){
          //When we find the object having the url selected, we change its checked value

            if(i.checked === false){
              newData = [...newData, { url: i.url, checked: true}];

            } else {
              newData = [...newData, { url: i.url, checked: false}]
            }

            
        } else {
            //Otherwise, we just add the data 
            newData = [...newData, i]
        }
    })

    this.setState({
        productBeingEditedCurrentUrlImagesWithChekedOption : newData,
        selectedImages: selectedImages
      })
  
  }


  deleteImageOnThePage = e => {
    e.preventDefault()

    let imagesWithCheck = this.state.productBeingEditedCurrentUrlImagesWithChekedOption 
    let newCurrentImages = imagesWithCheck.filter(i => i.checked !== true)

    this.setState({
      productBeingEditedCurrentUrlImagesWithChekedOption: newCurrentImages,
      cancelImageDeletingAllowed: true
    })

    
  }

  cancelDeleteCurrentImageHandler = e => {
    e.preventDefault()

    const { selectedImages, productBeingEditedCurrentUrlImagesWithChekedOption } = this.state;

    let deletedImages = [];



    selectedImages.forEach( url => {
      deletedImages = [...deletedImages, { url: url, checked: true}]
    })

    let oldImagesWithCheck = [...productBeingEditedCurrentUrlImagesWithChekedOption, ...deletedImages]



    this.setState({ productBeingEditedCurrentUrlImagesWithChekedOption: oldImagesWithCheck })

  }



  

  render() {
    const fullFormPart = this.state.fullFormPart;

    return (
      <section className="add-product">
        <form className="add-product__form">

          <div className={`add-product__part add-product__part--details 
                           ${this.state.showImage === true ? 'hide' : '' }`}>

            {fullFormPart.map(part => (

              <div className="add-product__part--details__section" key={part[0].formType}>
                <h3 className="add-product__form__title">{part[0].formType}</h3>
                    {part.map(i => (
                    <Input
                        className="add-product__input"
                        key={i.id}
                        id={i.id}
                        placeholder={i.placeholder}
                        control={i.control}
                        type={i.type}
                        value={ this.state.editingMode === false ? i.value : this.state.newFullForm[i.id]
                          }
                        formType={i.formType}
                        onChange={this.inputChangeHandler}
                    />
                    ))}
              </div>

            ))}

            <div className="add-product__part--details__section">
                <h3 className="add-product__form__title">options</h3>
                <FormFeature featuresList={this.state.featuresList}
                             addFeatureChangeHandler={this.addFeatureChangeHandler}
                             value={this.state.featureBeingAdded}
                             addFeature={this.addFeature}
                             deleteFeature= {this.deleteFeature}
                />
            </div>
            
            <div className="add-product__form__controller">
                <Button onClick={this.showImageFormHandler}>
                    next
                </Button>
                
            </div>
          </div>
          
          <div className={`add-product__part add-product__part--image 
                           ${this.state.showImage === true ? 'show' : '' }`}>
                <h3 className="add-product__form__title">Images</h3>          
                <Filepicker filesHandler={this.filesHandler}
                            productBeingEditedCurrentImages={this.state.productBeingEditedCurrentUrlImagesWithChekedOption}
                            editingMode={this.state.editingMode}
                            selectDeleteHandler={this.selectDeleteHandler}
                            selectedImages ={this.state.selectedImages}
                            onDeleteCurrentImages = {this.deleteImageOnThePage}
                            cancelDeleteImagesAlowed = {this.state.cancelImageDeletingAllowed}
                            onCancelDeleteCurrentImages={this.cancelDeleteCurrentImageHandler}
                />
                <div className="add-product__form__controller">
                        <Button onClick={this.hideImageFormHandler}>
                            previous 
                        </Button>
                        <Button onClick={this.uploadHandler}>
                            upload
                        </Button>
                        <Button onClick={this.over}>
                            State
                        </Button>
                </div>  
          </div>  

          

          

          
        </form>
      </section>
    );
  }
}

const mapStateToProps = state => {
  return {
      productBeingEdited: state.products.productRequested
  }
}
export default connect(mapStateToProps)(AddProduct);


