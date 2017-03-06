var studioID = 146521;
function getID() {
    return new Promise(function (resolve, reject) {resolve(studioID)});
}

function getPeople(type, idPromise) { // "curators" or "owners" (managers)
    return idPromise().then(function (id) {
        return axios.get("https://crossorigin.me/https://scratch.mit.edu/site-api/users/" + type + "-in/" + id + "/1/", {responseType: 'document'})
            .then(function(response) {
                return parsePeople(response.data);
            });
    });
}

function parsePeople(page) {
    return Array.from(page.querySelectorAll('li > .avatar > .title > a')).map(
      function(person){
        return person.innerHTML;
      }
    )
}

function nextLink(id, curators, page, count, previous) {
    if (id) {
        console.log('Checking page ' + page + '...');
        loadPage(page);
        return axios.get("https://crossorigin.me/https://scratch.mit.edu/site-api/comments/gallery/" + id, {responseType: 'document', params: {page: page}}).then(function (response) {
            result = parseComments(id, curators, response.data, count);
            if (result[0]) { // There's more comments to find!
                return nextLink(id, curators, ++page, result[1], result);
            } else {
                console.log("Found latest link!");
                return previous;
            }
        });
    } else {
        return [0, 0];
    }
}

function parseComments(id, curators, doc, currentCount) {
    var commentList = Array.from(doc.querySelectorAll('.top-level-reply')).reverse().filter( //Get only comments with links in them
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
      return [false, currentCount]; //All comments on page have been checked, so this should return the first comment of the next page (commentList[0]) if the next page *isn't* done
    } else {
      return [formatLink(id, commentList[lastReply+1].getAttribute('data-thread')), currentCount += tempCount]; // last unread link
    }
}

function formatLink(id, lastCommentId){
  return "https://scratch.mit.edu/studios/" + id + "/comments/#comments-" + lastCommentId;
}

function changeLink(link){
  document.getElementById("link").href=link;
  document.getElementById("link").innerHTML = "Next Project!"
}

function changeCount(count){
  document.getElementById("projectcount").innerHTML = count + " projects left to review or add to the spreadsheet!";
}

function loadPage(page) {
    document.getElementById("projectcount").innerHTML = "Loading latest data... (page " + page + ")";
}

axios.all([getID(), getPeople('owners', getID), getPeople('curators', getID)])
    .then(function(info) {
        document.getElementById("projectcount").innerHTML = "Loading latest data...";
        console.log("Studio ID is " + info[0]);
        id = info[0];
        nextLink(info[0], info[1].concat(info[2]), 1, 0, ["https://scratch.mit.edu/studios/" + info[0], 0]).then(function (result) {
            changeLink(result[0]);
            changeCount(result[1]);
            if (result[1] == 0) {
                document.getElementById("link").innerHTML = "All done!"
            }
        });
    });
