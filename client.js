let serverRes;


function addIngredient() {
    allIngred = ( typeof allIngred != 'undefined' && allIngred instanceof Array ) ? allIngred : [];
    let input = document.getElementById("input").value.trim();
    document.getElementById("input").value = '';
    let errMsg = checkErr(input);
    if (errMsg != "") {
        handleErr(errMsg);
        return;
    }
    allIngred.push(input);
    let allPara = document.getElementsByTagName("p");
    allPara[allPara.length-1].innerHTML = '<p class="ing"><button id="' + "addA" + `${input}` + '"  class="button2 cur" onclick="removeIngerdient(this.id)">' +
    '<span id="dele"> &#10754 </span>' +
    `${input}` + '</button> </p>' +
    '<p class="ing"> </p>';
}

function handleErr(err) {
    document.getElementById("input").style.border = "0.3em solid red";
    document.getElementById("errDiv").innerText = err;
    return;
}

function checkErr(input) {
    let err = "";
    if (input == '') {
        err = "An ingredient can't be empty. please try again";
    } else if (/\d/.test(input)) {
        err = "An ingredient can't include numbers. please try again";
    } else if (allIngred.includes(input)) {
        err = "This ingredient already included. please add another or try to submit";
    } else if (allIngred.length == 6) {
        err = "You can only add 6 ingredient"
    }
    return err;
}

function focusFunc() {
    let html = document.getElementById("htmlPage");
    let noRec = document.getElementsByTagName("h3");
    if (document.getElementById("errDiv").innerText != '') {
        document.getElementById("input").style.border = "0.3em solid transparent";
        document.getElementById("errDiv").innerText = '';
    }
    if (noRec.length > 0) {
        noRec[0].parentNode.removeChild(noRec[0]);
    }
    return;
}

function recipes() {
    if (typeof allIngred == 'undefined' || allIngred.length == 0) {
        let errMsg = checkErr('');
        handleErr(errMsg);
        return;
    }
    let xhr = new XMLHttpRequest();
    let params = allIngred.join("&");
    serverRes = request('GET', '/search'+"?"+params, true);
    serverRes.then(recipesArr =>  { 
        showRecipes(recipesArr);
    });
    serverRes.catch(err =>  { 
        console.log(err);
    });
    return serverRes;

}

function request(method, url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.addEventListener('load', e => {
      resolve(JSON.parse(e.target.responseText))
      });
      xhr.addEventListener('error', reject => console.log(reject));
      xhr.send();
    });
 
}

function removeIngerdient(id) {
    document.getElementById(id).remove();
    let name = id.replace("addA","");
    let index = allIngred.indexOf(name);
    if (index > -1) {
        allIngred.splice(index, 1);
      }
}

function isEnter(e) {
    if (e.keyCode === 13) {
        document.getElementById("add").click();
    }
}

function showRecipes(recipesArr){
    allIngred = []; // empty array for if pervious button clicked
    let html = document.getElementById("htmlPage");
    let iter = 0;
    let back = document.getElementById("back");
    var text = document.createTextNode("Back");
    back.appendChild(text);
    html.innerHTML = '';
    if (recipesArr.length > 0) {
        recipesArr.forEach(recipe => {
            html.innerHTML += 
            '<div id="header">' +  "<h5>" + recipe.name +  "</h5>" +
            '<input type="image" class="imageRecipe" src="' + recipe.image + '" + id="' + iter + '"/>'
            + '<div id="middle" onclick="window.open(`' + recipe.url + '`)">' + "<h6>" + '<span id="title"> Nutrition Values: </span>' + showDict(recipe.nutrition) + "</h6>" + '</div>'
            + '</div>';
            iter++;
        });
    } else {
        // let allPara = document.getElementsByTagName("p");
        // while (allPara[0]) allPara[0].parentNode.removeChild(allPara[0])
        // emptyPar = document.createElement('p'); 
        // html.appendChild(emptyPar);
        noRecipe = document.createElement('h3');
        noRecipe.innerHTML = "There are no recipes found for this ingredients. You can try again!";
        html.appendChild(noRecipe);
        
        let cssBack = "float: center;font-size: 4rem;margin: 1em auto;position: relative;top: 17.5rem;left: 33rem; text-align: center;width: 15rem;background-color: #efdbbf;color: #efedce;border-radius: 15%;text-decoration: none;";
        back.style.cssText = cssBack;
    }
    return;

}

         
function showDict(dict) {
    let str = "\n";
    Object.keys(dict).forEach(key => {
       str += key + ": " + dict[key] + ".\n";
    });
    return str;
}             
         



