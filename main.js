var studioid = 2050750;

/*var request = new XMLHttpRequest();
request.open('GET', 'https://api.scratch.mit.edu/proxy/featured', false);  // `false` makes the request synchronous
request.send(null);

if (request.status === 200) {
  studioid = JSON.parse(request.responseText).scratch_design_studio[0].gallery_id;
  console.log('found latest studio');
} else {
  studioid = 0;
  console.log("ERROR");
}*/

var curators = ["Paddle2See*","jbuitrago0510*", "technoboy10*", "natalie*", "ceebee*", "speakvisually*", "cartoonnetwork", "The_Grits", "4LeafClovR", "puppymk", "Malik44", "CrazyNimbus", "fmtfmtfmt2", "GreenIeaf", "st19_galla", "joletole", "Hamish752", "Abstract-", "getbent"];
var count = 0;
function getUnread(page){
  var commentList;
  var ownerList;
  var curatorList;
  var topList;
  //Grab comments
  var commentReq = new XMLHttpRequest();
  commentReq.onreadystatechange = function(){
    if (commentReq.readyState = 4){
      var container = document.implementation.createHTMLDocument().documentElement;
      container.innerHTML = commentReq.responseText;
      commentList = Array.from(container.querySelectorAll('.top-level-reply')).reverse().filter( //Get only comments with links in them
        function(comment){
          var c = comment.querySelector(".comment > .info > .content");
          if (c){
            return c.innerHTML.match(/projects\/[0-9]+/) != null;
          }
        }
      ).map(
        function(comment){
          return comment.querySelector('.replies');
        }
      )

    }
  }
  commentReq.open("GET", "https://edu.crossorigin.me/https://scratch.mit.edu/site-api/comments/gallery/" + studioid + "/?page=" + page , false);
  commentReq.send(null);

  /*var curatorReq = new XMLHttpRequest();
  curatorReq.onreadystatechange = function(){
    if (curatorReq.readyState = 4){
      var container = document.implementation.createHTMLDocument().documentElement;
      container.innerHTML = curatorReq.responseText;
      curatorList = Array.from(container.querySelectorAll('li > .avatar')).map(
        function(person){
          return person.getAttribute('data-id');
        }
      )
    }
  }
  curatorReq.open("GET", "https://edu.crossorigin.me/https://scratch.mit.edu/site-api/users/curators-in/" + studioid + "/1/" , false);
  curatorReq.send(null);

  var ownerReq = new XMLHttpRequest();
  ownerReq.onreadystatechange = function(){
    if (ownerReq.readyState = 4){
      var container = document.implementation.createHTMLDocument().documentElement;
      container.innerHTML = ownerReq.responseText;
      ownerList = Array.from(container.querySelectorAll('li > .avatar')).map(
        function(person){
          return person.getAttribute('data-id');
        }
      )
    }
  }
  ownerReq.open("GET", "https://edu.crossorigin.me/https://scratch.mit.edu/site-api/users/owners-in/" + studioid + "/1/" , false);
  ownerReq.send(null);

  curators = ownerList + curatorList;*/

  //document.querySelectorAll('li > .avatar')[0].getAttribute('data-id')

  //Parse through array
  var tempCount = commentList.length;
  var lastReply = -1;
  for (i = 0; i < commentList.length; i++){
    var replyList = commentList[i].querySelectorAll('.reply > .comment'); //Get all comments
    for (j = 0; j < replyList.length; j++){ //go through replies
      if(curators.indexOf(replyList[j].querySelector(".info > .name > a").innerHTML) != -1){ //pick comment by a curator
        if (replyList[j].querySelector(".info > .content").textContent.match(/added/i)){
          lastReply = i;
          tempCount--;
          break;
        }
      }
    }
  }
  if (lastReply == commentList.length-1){
    return false; //All comments on page have been checked, so this should return the first comment of the next page (commentList[0]) if the next page *isn't* done
  } else {
    count += tempCount;
    return commentList[lastReply+1].getAttribute('data-thread'); // last unread link
  }

}

function formatLink(lastCommentId){
  return "https://scratch.mit.edu/studios/" + studioid + "/comments/#comments-" + lastCommentId;
}

function changeLink(link){
  document.getElementById("link").href=link;
}

function changecount(count){
  document.getElementById("projectcount").innerHTML = count + " projects left to review!";

}

function nextLink(){
  var previousLink;
  var link = true;
  var page = 1;
  count = 0;
  while (link){
    previousLink = link;
    link = getUnread(page);
    console.log(page + ' and ' + link);
    page++;
  }
  if (previousLink != true){
    return formatLink(previousLink);
  } else {
    return "https://scratch.mit.edu/studios/" + studioid + "/comments/";
  }
}
