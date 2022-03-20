import { hello } from "../../declarations/hello";
import {Principal} from "@dfinity/principal";

async function post() { 
  let post_button = document.getElementById("post");
  let error = document.getElementById("error");
  error.innerText = "";
  post_button.disable = true;
  let textarea = document.getElementById("message");
  let opt = document.getElementById("opt").value;
  try{
    await hello.post(opt, textarea.value);
    textarea.value = "";
  }catch(err){
    error.innerText = "Post Failed!";
  }
  post_button.disable = false;
  load_posts("0");
}

async function set_name() { 
  let set_button = document.getElementById("btn_set");
  let error = document.getElementById("set_error");
  error.innerText = "";
  set_button.disable = true;
  let textarea = document.getElementById("set");
  let opt = document.getElementById("opt").value;
  try{
    await hello.set_name(opt, textarea.value);
  }catch(err){
    error.innerText = "Set Failed!";
  }
  set_button.disable = false;
  error.innerText = "Success!";
}

async function follow() { 
  let follow_button = document.getElementById("btn_follow");
  let error = document.getElementById("follow_error");
  error.innerText = "";
  follow_button.disable = true;
  let textarea = document.getElementById("follow");
  try{
    await hello.follow(Principal.fromText(textarea.value));
  }catch(err){
    error.innerText = "Set Failed!";
  }
  follow_button.disable = false;
  reflesh_author_list();
}

async function reflesh_author_list(){
  let followed = await hello.follows();
  let followed_ul = document.getElementById("author_list");
  followed_ul.replaceChildren([]);
  let myself = document.createElement("input");
  myself.type = "radio";
  myself.name = "authorList";
  myself.id = "myself";
  myself.value = "0";
  myself.checked = true;
  followed_ul.appendChild(myself);
  let lab_myself = document.createElement("label");
  lab_myself.innerText = "My message";
  lab_myself.setAttribute("for", "myself");
  followed_ul.appendChild(lab_myself);
  followed_ul.appendChild(document.createElement("br"));
  let lab_all_author = document.createElement("label");
  lab_all_author.innerText = "Following Authors:";
  followed_ul.appendChild(lab_all_author);
  followed_ul.appendChild(document.createElement("br"));
  followed.forEach(function(item){
    let author = document.createElement("input");
    author.type = "radio";
    author.name = "authorList";
    author.id = "author";
    author.value = item[0].toText();
    followed_ul.appendChild(author);
    let lab_author = document.createElement("label");
    lab_author.innerText = item[1];
    lab_author.setAttribute("for", "author");
    followed_ul.appendChild(lab_author);
    followed_ul.appendChild(document.createElement("br"));
  });
}

async function load_posts(author) {
  let posts_section = document.getElementById("posts");
  var posts;
  if (author == undefined) return;
  switch(author) {
    case "0":
      posts = await hello.posts(1000);
      break;
    default:
      posts = await hello.timeline([Principal.fromText(author)], 1000);
  }
  posts_section.replaceChildren([]);
  for (var i = 0; i< posts.length; i++) { 
    let post = document.createElement("p");
    post.innerText = "[" + new Date(Number(posts[i].time/1000000n)).toLocaleString() + "] <" + posts[i].author + "> " + posts[i].text;
    posts_section.appendChild(post)
  }
}

function load() { 
  let post_button = document.getElementById("post");
  post_button.onclick = post;
  let set_button = document.getElementById("btn_set");
  set_button.onclick = set_name;
  let follow_button = document.getElementById("btn_follow");
  follow_button.onclick = follow;

  let followed_ul = document.getElementById("author_list");
  followed_ul.onclick = function (event) {
    const {target} = event;
    if (target.tagName.toLowerCase() !== "input") return;
    load_posts(target.value);
  };
  load_posts();
  reflesh_author_list();
}

window.onload = load;