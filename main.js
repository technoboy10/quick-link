var studioid = 3600717;

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

var curators;
var count = 0;
function getUnread(page){
  return new Promise(function(resolve, reject) {
    var commentList;
    var ownerList;
    var curatorList;
    var topList;
    //Grab comments
    var commentReq = new XMLHttpRequest();
    commentReq.open("GET", "https://crossorigin.me/https://scratch.mit.edu/site-api/comments/gallery/" + studioid + "/?page=" + page , true);
    commentReq.onload = function(){
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
        );
      //Parse through array
      var tempCount = commentList.length;
      var lastReply = -1;
      for (i = 0; i < commentList.length; i++){
        var replyList = commentList[i].querySelectorAll('.reply > .comment'); //Get all comments
        for (j = 0; j < replyList.length; j++){ //go through replies
          if(curators.indexOf(replyList[j].querySelector(".info > .name > a").innerHTML) != -1){ //pick comment by a curator
            lastReply = i;
            tempCount--;
            break;
          }
        }
      }
      if (lastReply == commentList.length-1){
        resolve(false); //All comments on page have been checked, so this should return the first comment of the next page (commentList[0]) if the next page *isn't* done
      } else {
        count += tempCount;
        resolve(commentList[lastReply+1].getAttribute('data-thread')); // last unread link
      }
    }
    commentReq.send();
  });
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

function getCurators(){
    var curatorReq = new XMLHttpRequest();
    curatorReq.open("GET", "https://crossorigin.me/https://scratch.mit.edu/site-api/users/curators-in/" + studioid + "/1/" , true);
    curatorReq.onload = function () {
      var container = document.implementation.createHTMLDocument().documentElement;
        container.innerHTML = curatorReq.responseText;
        curatorList = Array.from(container.querySelectorAll('li > .avatar > .title > a')).map(
          function(person){
            return person.innerHTML;
          }
        )
      }
    curatorReq.send();

    var ownerReq = new XMLHttpRequest();
    ownerReq.open("GET", "https://crossorigin.me/https://scratch.mit.edu/site-api/users/owners-in/" + studioid + "/1/" , true);
    ownerReq.onload = function () {
        var container = document.implementation.createHTMLDocument().documentElement;
        container.innerHTML = ownerReq.responseText;
        ownerList = Array.from(container.querySelectorAll('li > .avatar > .title > a')).map(
          function(person){
            return person.innerHTML;
          }
        )
        curators = ownerList.concat(curatorList);
      }
    ownerReq.send();
    console.log(curators);
}

function nextLink(prevLink, page){
  return new Promise(function(resolve, reject) {
    var previousLink;
    var page = 1;
    count = 0;
    getCurators();
    getUnread(page).then(function (res) {
      if (!prevLink && res){
        resolve(formatLink(previousLink));
      } else {
        console.log(page + ' and ' + link);
        nextLink(res, page + 1).then(function (link) {resolve(link)});
     }
   });
 });
}
