
// Initialize Firebase
const config = {
  apiKey: "AIzaSyDhv_IiI8z3dYAqHxlm053awmRGHvAgPNs",
  authDomain: "inf551-38148.firebaseapp.com",
  databaseURL: "https://inf551-38148.firebaseio.com",
  projectId: "inf551-38148",
  storageBucket: "inf551-38148.appspot.com",
  messagingSenderId: "540374874202"
};

firebase.initializeApp(config);

var database = firebase.database();
var number_of_recent_query = 3;
var category_post = {"Life Style": "life", "News":"news", "Sports":"sports", "Events":"events", "Others":"others"}

loadData(database);
// loadNews();
// queryData_key("category","sports");

document.getElementById("btnCreatePost").addEventListener("click",function() {
  const post_text = document.getElementById("post_box").value;
  const file = document.getElementById('uploadPhoto').files[0];

  if (post_text == null || post_text=="", file==null || file=="") {
    console.log("empty input!");
    document.getElementById("post_box").focus();
    // document.getElementById("post_box").popover();
    // $('post_box').popover();
  } else {

    CreatePost(firebase, database);
    $('#myModal').modal('hide');
    document.getElementById("post_box").value = "";
  }
});



firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // console.log(user.email);
    // console.log(user);
    console.log(user.displayName);
    document.getElementById('btnLogIn_navbar').text = "Me";
    if (user.displayName != null) {
      document.getElementById('login_dropdown_header').innerText = user.displayName;
    }
    // document.getElementById('login_dropdown_header').innerText = user.displayName;
    $('#login_link').hide();
    $('#signup_link').hide();
    $('#linkMyPost').show();
    $('#logout_link').show();
    $('#login_dropdown_header').show();
    // nav_login.data = user.displayName;
  } else {
    document.getElementById('btnLogIn_navbar').text = "Login";
    // $('#login-modal').modal('hide');
    $('#login_link').show();
    $('#signup_link').show();
    $('#linkMyPost').hide();
    $('#logout_link').hide();
    $('#login_dropdown_header').hide();
    // $('#login-modal').modal('show');
    console.log('not logged in');
  }
  // clearPosts();
  // loadData(database);
});

function showSignUpAlert(message) {
    $('#alert_signup_failed').html("<div>"+"<strong>Sign Up Failed! </strong>"+message+"</div>");
    $('#alert_signup_failed').show();
}

function showLoginAlert(message) {
    $('#alert_login_failed').html("<div>"+"<strong>Log In Failed! </strong>"+message+"</div>");
    $('#alert_login_failed').show();
}

function clearLoginForm() {
  $('#loginForm').get(0).reset();
  document.getElementById("alert_login_success").style.display="none";
  if (document.getElementById("btnLogIn").disabled == true) {
    document.getElementById("btnLogIn").disabled = false;
  }
}

function clearSignupForm() {
  $('#signupForm').get(0).reset();
  document.getElementById("alert_signup_success").style.display="none";
  if (document.getElementById("btnSignUp").disabled == true) {
    document.getElementById("btnSignUp").disabled = false;
  }
}

function CreatePost(firebase, database) {
  // const file = $('samplePhoto').get(0);
  var user = firebase.auth().currentUser;
  if (user != null) {
    var author = user.displayName;
    console.log("post by " + author);
    var content = document.getElementById("post_box").value;
    var img = "http://placehold.it/750x300";
    var category = document.getElementById("post_category").value;
    var time = Date();

    const file = document.getElementById('uploadPhoto').files[0];
    console.log(file);
    const fileName = (+new Date()) + '-' + file.name;
    const metadata = {
      contentType: file.type
    };
    const storageRef = firebase.storage().ref('/images/' + fileName);
    const uploadTask = storageRef.put(file, metadata);
    uploadTask.then((snap) => {
      const imageURL = snap.downloadURL;
      // console.log(imageURL);
      var img = imageURL;
      writePostData(author, category_post[category], content, img, time);
      console.log("write data!");

    })
    document.getElementById('uploadPhoto').value = "";
  }
  // var author = "Brian";
}

function readDataToPost(newPost) {
  var author = newPost.author;
  var content = newPost.content;
  var img = newPost.post_img;
  var time = convertFullDateToShort(newPost.post_time);
  var post_id = newPost.post_id
  makePost(database, author, content, img, time, post_id);
}

function queryData_key(key, target) {
  var postRef = database.ref().child("Posts/post/");
  postRef.off();
  postRef.orderByChild(key).equalTo(target).on("child_added", function(snap) {
    // console.log("kkk");
    var newPost = snap.val();
    readDataToPost(newPost);
  });
  // postRef.off();
};

function queryData_category(category) {
  var postRef = database.ref().child("Posts/post/");
  postRef.orderByChild(category).on("child_added", function(snap) {
    var newPost = snap.val();
    readDataToPost(newPost);
  })
};

function queryData_content(fold, database, queryText) {
  var postRef = database.ref().child("Posts/" + fold + "/");
  var queryText = queryText.toLowerCase();
  postRef.on("child_added", function(snap) {
    // console.log(snap);
    var newPost = snap.val();
    var content = newPost.content;
    var author = newPost.author;
    // var content_lower = content.toLowerCase();
    if (content.toLowerCase().includes(queryText) || author.toLowerCase().includes(queryText)) {
      readDataToPost(newPost);
    }
  })
};

function queryData_title(fold, database, queryText) {
  var postRef = database.ref().child("Posts/" + fold + "/");
  var queryText = queryText.toLowerCase();
  postRef.on("child_added", function(snap) {
    // console.log(snap);
    var news = snap.val();
    var title = news.title;
    var author = news.authors;
    // var content_lower = content.toLowerCase();
    if (title.toLowerCase().includes(queryText) || author.toLowerCase().includes(queryText)) {
      // var author = newPost.author;
      retreive_create_news(news);
    }
  })
};


function clearPosts() {
  document.getElementById("post_area").innerHTML = "";
  // $("#post_area").html("");
  console.log("clear posts");
}

function loadData(database) {
  var postRef = database.ref().child("Posts/post/");
  postRef.off();
  const items = [];
  // var lastKey = "";
  // var startKey = ""
  console.log("loading data...");
  postRef.on("child_added", function(snap, prevChildKey) {
    var newPost = snap.val();
    readDataToPost(newPost);
  })
  // console.log(lastKey);
}

function loadNews() {
  var postRef = database.ref().child("Posts/daily_trojan/");
  const items = [];
  // var lastKey = "";
  // var startKey = ""
  postRef.on("child_added", function(snap, prevChildKey) {
    var news = snap.val();
    // console.log(news);
    retreive_create_news(news);
  })
  // console.log(lastKey);
}

function retreive_create_news(news) {
  var author = news.authors;
  var title = news.title;
  var description = news.firstParagraph;
  var link = news.link
  var img = news.photo;
  var time = news.time;
  if (description.length > 200){
    description = description.slice(0, 200) + "..."
  }
  makeNewsPost(author, title, description, convertFullDateToShort(time), link, img);
}

function convertFullDateToShort(full) {
  var months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = new Date(full);
  // console.log(date);
  var short = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  return short;
}

function deletePost(id) {
  database.ref('Posts/post/' + id).remove();
}

function writePostData(author_name, post_category, post_content, imageUrl, time) {
    var postRef = database.ref('Posts/post');
    var newPostRef = postRef.push();
    var postID = newPostRef.key;
    console.log("post id"+postID);
    newPostRef.set({
      author: author_name,
      category: post_category,
      content: post_content,
      post_img:imageUrl,
      post_time : time,
      post_id: postID
    });
  }

function makePost(database, author, content, img, time, post_id) {
  // create post card
  var post_card = document.createElement("div");
  post_card.setAttribute('class','card mb-4');
  post_card.setAttribute('post_id', post_id);
  // create post img
  var post_img = document.createElement("img");
  post_img.setAttribute('class','card-img-top');
  post_img.setAttribute('src', img);
  post_img.setAttribute('alt', 'Card image cap');
  post_img.addEventListener("click", function(){
    document.getElementById("imgPrview").src = img;
    $('#imgModal').modal('show');
  })
  post_card.appendChild(post_img);
  // create post content
  
  var card_body = document.createElement("div");
  card_body.setAttribute('class','card-body row');
  // card_body.style.cssText = "padding-bottom: 0.5px";
  // card_body.style.cssText = "padding-top: 5px";


  var dropdown_area = document.createElement("div");
  dropdown_area.setAttribute('class', 'dropdown col-1');
  var dot_menu = document.createElement("div");
  dot_menu.setAttribute('class', 'dot-menu');
  dot_menu.setAttribute('align', "right");
  dot_menu.setAttribute('data-toggle', "dropdown");
  dot_menu.style.cssText = "cursor: pointer;";
  var dropdown_menu = document.createElement("div");
  dropdown_menu.setAttribute('class', 'dropdown-menu');
  // var dropdown_header = document.createElement('h6');
  // dropdown_header.setAttribute('class', 'dropdown-header');
  // dropdown_header.textContent = "Edit Post";
  var dropdown_remove = document.createElement("a");
  dropdown_remove.setAttribute('href','#');
  dropdown_remove.setAttribute('class','dropdown-item disabled');
  dropdown_remove.textContent = "remove post";
  dot_menu.addEventListener("click", function() {
    var user = firebase.auth().currentUser;
    if (user) {
      if (user.displayName == author) {
        dropdown_remove.setAttribute('class','dropdown-item');
      }
    }
  })
  dropdown_remove.addEventListener("click", function() {
    // console.log(post_id);
    deletePost(post_id);
    clearPosts();
    loadData(database);
  })
  
  // dropdown_menu.appendChild(dropdown_header);
  dropdown_menu.appendChild(dropdown_remove);
  dropdown_area.appendChild(dot_menu);
  dropdown_area.appendChild(dropdown_menu);

  var paragraph = document.createElement("p");
  paragraph.setAttribute('class', 'card-text col-11')
  paragraph.style.cssText = "margin-bottom: 0px;";
  paragraph.style.cssText = "padding-top: 5px;";
  // paragraph.style.cssText = "padding-left: 20px;";

  paragraph.textContent = content;
  card_body.appendChild(paragraph);
  card_body.appendChild(dropdown_area);

  // card_body.textContent = content;

  // card_body.appendChild(dropdown_area);
  post_card.appendChild(card_body);

  // create meta data
  var card_meta = document.createElement("div");
  card_meta.setAttribute('class','card-footer text-muted');
  var author_link = document.createElement('a');
  var link_text = document.createTextNode(author);
  author_link.appendChild(link_text);
  author_link.href = "#";
  card_meta.textContent = "Posted on " + time + " by ";
  card_meta.appendChild(author_link);
  author_link.addEventListener("click" , function() {
    clearPosts();
    queryData_key("author", author);
    // console.log("haha");
  });
  post_card.appendChild(card_meta);
  document.getElementById("post_area").insertBefore(post_card, document.getElementById("post_area").firstChild);  
}

function makeNewsPost(author, title, description, time, link, photo) {
  // console.log(description);
  // create post card
  var post_card = document.createElement("div");
  post_card.setAttribute('class','card mb-4');

  // create post img
  img = "https://firebasestorage.googleapis.com/v0/b/inf551-38148.appspot.com/o/images%2F1524271402355-dailytrojan.jpg?alt=media&token=a25c1ffc-4f7c-467d-82cf-cca7591e50f5"
  var post_img = document.createElement("img");
  post_img.setAttribute('class','card-img-top portrait');
  if (photo.length > 10) {
    // console.log(photo);
    post_img.setAttribute('src', photo);
  } else {
    post_img.setAttribute('src', img);
  }
  // post_img.setAttribute('src', img);
  post_img.setAttribute('alt', 'Card image cap');
  // post_img.addEventListener("click", function(){
  //   document.getElementById("imgPrview").src = img;
  //   $('#imgModal').modal('show');
  // })
  var thumbnail = document.createElement("div");
  thumbnail.setAttribute('class', 'thumbnail');
  thumbnail.appendChild(post_img);
  post_card.appendChild(thumbnail);

  var card_title = document.createElement("h2");
  card_title.setAttribute('class', 'card-title');
  card_title.textContent = title;
  post_card.appendChild(card_title);

  // console.log(description);
  // create post content
  var card_body = document.createElement("div");
  card_body.setAttribute('class','card-body');
  card_body.textContent = description;
  var news_link = document.createElement('a');
  news_link.setAttribute('class','"btn btn-primary"')
  news_link.textContent = "Read More";
  news_link.href = link;
  card_body.appendChild(document.createElement('br'));
  card_body.appendChild(news_link);
  post_card.appendChild(card_body);
  // create meta data
  var card_meta = document.createElement("div");
  card_meta.setAttribute('class','card-footer text-muted');
  var author_link = document.createElement('a');
  var link_text = document.createTextNode(author);
  // author_link.appendChild(link_text);
  // author_link.href = "#";
  card_meta.textContent = "Posted on " + time + " by " + author;
  // card_meta.appendChild(author_link);
  // author_link.addEventListener("click" , function() {
  //   clearPosts();
  //   queryData_key("author", author);
  // });
  post_card.appendChild(card_meta);
  document.getElementById("post_area").insertBefore(post_card, document.getElementById("post_area").firstChild);  
}

function searchPost(queryText){
  if (queryText) {
    var user = firebase.auth().currentUser;
    if (user) {
      // console.log(user.uid);
      var postRef = database.ref('Posts/user_record');
      postRef.child(user.uid).on("child_added", function(snap) {
        var recent_query = snap.val();
        if (recent_query.length > 0 && recent_query != "") {
          var idx = recent_query.indexOf(queryText);
          if (idx != -1) {
            // var tamp = recent_query[0];
            // recent_query[0] = queryText;
            // recent_query[idx] = tamp;
            recent_query.splice(idx, 1);
          } 
          recent_query.splice(0, 0, queryText);
          
          if (recent_query.length > number_of_recent_query) {
            recent_query.pop(); // pop the last search
          }
        } else {
          recent_query = [queryText];
        }
        postRef.child(user.uid).set({
          query: recent_query
        });
      })
      // postRef.child(user.uid).set({
      //   query: [queryText]
      // });
    }
    clearPosts();
    queryData_content("post", database, queryText);
    queryData_title("daily_trojan", database, queryText);

  }
  document.getElementById("search_box").value = "";
}

function linkToPost(key, content) {
  if (key == "author") {
    var user = firebase.auth().currentUser;
    if (user) {
      clearPosts();
      queryData_key(key, user.displayName);
    } else {
      console.log("fail see my post! no user log in");
    }
  } else {
    clearPosts();
    queryData_key(key, content);
    // queryData_category(category);
  }
}

function hideSearchHistory(){
  document.getElementById("search_history").style.visibility = "hidden";
  document.getElementById("recent_search1").style.visibility = "hidden";
  document.getElementById("recent_search2").style.visibility = "hidden";
  document.getElementById("recent_search3").style.visibility = "hidden";
}

function clearSearchHistory(){
  document.getElementById("recent_search1").textContent = "";
  document.getElementById("recent_search2").textContent = "";
  document.getElementById("recent_search3").textContent = "";
}

document.getElementById("btnSignUp").addEventListener("click",function() {
  const firstName = document.getElementById("first_name_box").value;
  const lastName = document.getElementById("last_name_box").value;
  const email = document.getElementById("email_box").value;
  const pass = document.getElementById("password_box").value;
  const auth = firebase.auth();
  if (firstName==null || firstName=="" , lastName==null || lastName=="", email==null || email=="", pass==null || pass=="") {
    console.log("loss create information");
  } else {
    document.getElementById("btnSignUp").disabled = true;
    console.log("creating account...");
    auth.createUserWithEmailAndPassword(email, pass).then(function(user) {
      console.log("account create success");
      user.updateProfile({
        displayName: firstName + " " + lastName,
        // photoURL: "https://example.com/jane-q-user/profile.jpg"
      }).then(function(){
        document.getElementById('login_dropdown_header').innerText = user.displayName;
        console.log(user.displayName);
        var postRef = database.ref('Posts/user_record');
        var recent_query = "";
        postRef.child(user.uid).set({
          query: recent_query
        });
        console.log("query history created!")
      });
      document.getElementById("alert_signup_failed").style.display="none";
      document.getElementById("alert_signup_success").style.display="block";
      setTimeout(function(){ 
        $('#login-modal').modal('hide'); 
        clearSignupForm();
      }, 1000);
    }, function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      showSignUpAlert(errorMessage);
      document.getElementById("btnSignUp").disabled = false;
      document.getElementById("alert_signup_success").style.display="none";
      console.error(error);
      // }
    });
    // $('#login-modal').modal('hide');
  }
});

document.getElementById("btnLogIn").addEventListener("click",function() {
  const email = document.getElementById("login_email_box").value;
  const pass = document.getElementById("login_password_box").value;
  const auth = firebase.auth();
  if (email==null || email=="", pass==null || pass=="") {
    console.log("loss log in information");
  } else {
    document.getElementById("btnLogIn").disabled = true;
    auth.signInWithEmailAndPassword(email, pass).then(function(user) {
      console.log(user.displayName + " log in");
      document.getElementById("alert_login_failed").style.display="none";
      document.getElementById("alert_login_success").style.display="block";
      setTimeout(function(){ 
        $('#login-modal').modal('hide');
        clearLoginForm();
      }, 1000);
    }, function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      showLoginAlert(errorMessage);
      document.getElementById("btnLogIn").disabled = false;
      console.error(error);
    });
  }
  // $('#login-modal').modal('hide');
});

document.getElementById("logout_link").addEventListener("click", function() {
  firebase.auth().signOut();
  clearPosts();
  loadData(database);
  document.getElementById("loginBox").style.display="block";
  document.getElementById("signupBox").style.display="none";
});

document.getElementById("linkMyPost").addEventListener("click", function() {
  linkToPost("author", null);
});

document.getElementById("linkNewsPost").addEventListener("click", function() {
  linkToPost("category", "news");
});

document.getElementById("linkLifePost").addEventListener("click", function() {
  linkToPost("category", "life");
});

document.getElementById("linkSportsPost").addEventListener("click", function() {
  linkToPost("category", "sports");
});

document.getElementById("linkEventPost").addEventListener("click", function() {
  linkToPost("category", "events");
});

document.getElementById("linkOthersPost").addEventListener("click", function() {
  linkToPost("category", "others");
});

document.getElementById("linkHome").addEventListener("click", function() {
  clearPosts();
  loadData(database);
});

document.getElementById("btnBrand").addEventListener("click", function() {
  clearPosts();
  loadData(database);
});

document.getElementById("linkDailyTrojan").addEventListener("click", function() {
  clearPosts();
  loadNews();
});

document.getElementById("btnSearch").addEventListener("click", function() {
  var queryText = document.getElementById("search_box").value;
  searchPost(queryText);
});

document.getElementById("search_box").addEventListener("keyup", function(event) {
  // Cancel the default action, if needed
  event.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    document.getElementById("btnSearch").click();
  }
  hideSearchHistory();
});

document.getElementById("search_box").addEventListener("click", function() {
  // console.log("search_box clicked!");
  clearSearchHistory();
  hideSearchHistory();
  // document.getElementById("search_history").style.visibility = "visible";
  
  var user = firebase.auth().currentUser;
    if (user) {
      var postRef = database.ref('Posts/user_record');
      postRef.child(user.uid).on("child_added", function(snap) {
        var recent_query = snap.val();
        if (recent_query != "" && document.getElementById("search_box").value == "") {
          document.getElementById("search_history").style.visibility = "visible";
          for (var i = 0; i < recent_query.length; i ++) {
            // console.log("recent_search" + (i+1).toString());
            // console.log(recent_query[i]);
            document.getElementById("recent_search" + (i+1).toString()).style.visibility = "visible";
            document.getElementById("recent_search" + (i+1).toString()).textContent = recent_query[i];
          }
        }
      });

    }
});

document.getElementById("recent_search1").addEventListener("click", function() {
  var queryText = document.getElementById("recent_search1").textContent;
  searchPost(queryText);
});

document.getElementById("recent_search2").addEventListener("click", function() {
  var queryText = document.getElementById("recent_search2").textContent;
  searchPost(queryText);
});

document.getElementById("recent_search3").addEventListener("click", function() {
  var queryText = document.getElementById("recent_search3").textContent;
  searchPost(queryText);
});

// document.getElementById("btnPost").addEventListener("click", function() {
//   // var user = firebase.auth().currentUser;
//   // console.log(user);
  
// })

document.getElementById("login_link").addEventListener("click",function(){
  document.getElementById("loginBox").style.display="block";
  document.getElementById("signupBox").style.display="none";
  // $('#login-modal').modal('show');
});

document.getElementById("signup_link").addEventListener("click",function(){
  document.getElementById("loginBox").style.display="none";
  document.getElementById("signupBox").style.display="block";
});

// document.getElementById("samplePhoto").addEventListener("click", function() {
//   var imgSrc = document.getElementById("samplePhoto").src;
//   document.getElementById("imgPrview").src = imgSrc;
//   console.log(imgSrc);
// })
