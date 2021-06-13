var firebaseConfig = {
  apiKey: "AIzaSyBtuRZ5LU1dxTvdFzvE35G5HxR1Nqb3fDs",
  authDomain: "naiki-4fdc1.firebaseapp.com",
  databaseURL: "https://naiki-4fdc1-default-rtdb.firebaseio.com",
  projectId: "naiki-4fdc1",
  storageBucket: "naiki-4fdc1.appspot.com",
  messagingSenderId: "1035653636265",
  appId: "1:1035653636265:web:096d2bbea55f84a8a3c9b8",
};

firebase.initializeApp(firebaseConfig);
var databaseRef = firebase.database();
var loading = false;
var allRequets;
var allDonations;

var pageTitle = document.getElementById("page-heading");

var reqTitle = document.getElementById("r-title");
var reqDes = document.getElementById("r-des");
var reqType = document.getElementById("r-type");
var reqImageUrl;
var selectedRequest;
var selectedDonation;

const uploadImageRef = document.getElementById("uploadRequestImage");
const requestImage = document.getElementById("request-image");
requestImage.style.display = "none";
let requestImageUrl = "";
uploadImageRef.addEventListener("change", (e) => {
  // uploadinStatus.innerText = "uploading..."
  // progressBar.style.display = 'block';
  // progressBar.value = 20;
  const ref = firebase.storage().ref();
  let file = e.target.files[0];
  const name = +new Date() + "-" + file.name;
  const metadata = {
    contentType: file.type,
  };
  const fileRef = ref.child(name);
  const task = fileRef.put(file, metadata);
  task.on(
    "state_changed",
    function progress(snapshot) {
      //progress
      // let per = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      // progressBar.value = per;
    },
    function error(error) {
      console.log(error);
      // uploadinStatus.innerText = error;
      // uploadinStatus.style.color = 'red';
    },
    function complete() {
      // uploadinStatus.innerText = "Profile image uploaded successfully !";
      // uploadinStatus.style.color = 'green';
      fileRef.getDownloadURL().then((url) => {
        requestImageUrl = url;
        requestImage.src = url;
        requestImage.style.display = "block";
      });
    }
  );
});

function getMyRequests() {
  pageTitle.innerHTML = `<div style="height:100vh;margin-top:10rem;"> <h5> loading recommendations...</h5></div>`;
  loading = true;
  databaseRef
    .ref()
    .child("requests")
    .on("value", async (data) => {
      let values = [];
      console.log("data (getMyRequests) ", data);
      data.forEach((d) => {
        values.push({
          id: d.key,
          ...d.val(),
        });
      });
      pageTitle.innerHTML = ` <h3  style="color:orangered;margin-top:3rem">Recommendations</h3>`;
      values = values.filter((v) => v.state === "pending");
      allRequets = values;
      renderDonationCards(values);
    });
}

function getMyDonations() {
  pageTitle.innerHTML = `<div style="height:100vh"> <h5> loading data...</h5></div>`;
  loading = true;

  const userId = localStorage.getItem("userId");

  databaseRef
    .ref()
    .child("donations")
    .on("value", async (data) => {
      let values = [];
      data.forEach((d) => {
        values.push({
          id: d.key,
          ...d.val(),
        });
      });
      pageTitle.innerHTML = ` <h3 class="mt-5" style="color:orangered;">My Donations</h3>`;
      values = values.filter((v) => v.userId === userId);
      allDonations = values;
      renderMyDonationCards(values);
    });
}
function updateReuqestHandler(index) {
  const selected = allRequets[index];
  selectedRequest = selected;
  assignValuesToModal(selected);
}

function assignValuesToModal(request, forDonation = false) {
  if (forDonation === false) {
    console.log("selectedRequest ", selectedRequest);
    const categories = ["Clothes", "Food", "Medicine", "Householditems"];
    const index = categories.findIndex((c) => c === request.type);
    reqTitle.value = request.title;
    reqDes.value = request.description;
    reqType.selectedIndex = index;
    if (request.image != "") {
      requestImage.style.display = "block";
    }
    requestImage.src = request.image;
    donateFromRequest(selectedRequest);
  } else {
    let donation = request
    console.log("selectedDonation (assignValuesToModal) ", selectedDonation);
    const categories = ["Clothes", "Food", "Medicine", "Householditems"];
    const index = categories.findIndex((c) => c === donation.type);
    reqTitle.value = donation.title;
    reqDes.value = donation.description;
    reqType.selectedIndex = index;
    if (donation.image != "") {
      requestImage.style.display = "block";
    }
    requestImage.src = donation.image;
    document.getElementById('requestModalTrigger').click()
  }
}

async function deleteMyDonation(donationId) {
  console.log("donationId ", donationId);
  const donationRef = databaseRef.ref(`donations/${donationId}`);
  await donationRef.remove();
  const requestRef = databaseRef.ref(`requests/${donationId}`);
  await requestRef.remove();
  // window.alert("Donation deleted Successfully")
}

function updateDonationHandler(donationId) {
  let index = allDonations.findIndex((d) => d.id === donationId);
  if (index === -1) {
    return;
  }
  console.log("donationId(updateDonationHandler) ", donationId);
  const selected = allDonations[index];
  selectedDonation = selected;
  console.log("selectedDonation(updateDonationHandler) ", selectedDonation);
  assignValuesToModal(selected, true);
}
function renderMyDonationCards(donations) {
  console.log("donations", donations);
  let data = "";
  if (donations.length > 0) {
    donations.forEach((donation, idx) => {
      data += `	<div class="col-lg-4 col-md-4 col-sm-6">
                                <div class="fh5co-blog " >
                                    <a ><img class="img-responsive card-image" src="${donation.image
        }" alt=""></a>
                                    <div class="blog-text" style="margin-top:1rem !important" >
                                        <div class="prod-title">
                                            <h3><a href="" #><b>${donation.title
        }</b></a></h3>
                                            <span class="comment">${new Date(
          donation.created
        ).getDate()}/${new Date(
          donation.created
        ).getMonth()}/${new Date(donation.created).getFullYear()} </span>
                                            <p>${donation.description}</p>
                                        </div>
                                        <div>
                                        <button onclick="deleteMyDonation('${donation.id
        }')" type="button" class="btn-danger">Delete</button>
                                        <button onclick="updateDonationHandler('${donation.id
        }')" style="padding: 5px 5px;" type="button" class="btn-success">Update</button>
                                        </div>
                                    </div>
                                </div>
                                </div>`;
    });
  } else {
    data = `<div style="height:70vh">
        <h3>
        Currently you submitted no request !
        </h3>
        </div>`;
  }

  document.getElementById("myRequestsData").innerHTML = data;
}

function renderDonationCards(donations) {
  console.log(donations);
  let data = "";
  if (donations.length > 0) {
    donations.forEach((donation, idx) => {
      data += `	<div class="col-lg-4 col-md-4 col-sm-6">
                                <div class="fh5co-blog " >
                                    <a ><img class="img-responsive card-image" src="${donation.image
        }" alt=""></a>
                                    <div class="blog-text" style="margin-top:1rem !important" >
                                        <div class="prod-title">
                                            <h3><a href="" #><b>${donation.title
        }</b></a></h3>
                                            <span class="comment">${new Date(
          donation.created
        ).getDate()}/${new Date(
          donation.created
        ).getMonth()}/${new Date(donation.created).getFullYear()} </span>
                                            <p>${donation.description}</p>
                                        </div>
                                        <div>
                                        <label>Status: </label> <span>${donation.state.toUpperCase()}</span>
                                        </div>
                                        <div style="text-align:center;display:flex;justify-content:flex-end">
                                        <button onclick="updateReuqestHandler(${idx})" type="button" class="btn-success">Donate</button>
                                        </div>
                                    </div>
                                </div>
                                </div>`;
    });
  } else {
    data = `<div style="height:70vh">
        <h3>
        Currently you submitted no request !
        </h3>
        </div>`;
  }

  document.getElementById("myRequestsData").innerHTML = data;
}

function updateRequest() {
  const { userId, created, state } = selectedRequest;
  const obj = {
    title: reqTitle.value,
    description: reqDes.value,
    image: requestImageUrl,
    type: reqType.value,
    userId,
    created,
    state,
  };
  console.log("obj (updateRequest) ", obj);
  // if (selectedRequest && selectedRequest.id) {
  //     databaseRef.ref("/requests/" + selectedRequest.id).set(obj);
  //     window.alert("Request Updated Successfully");
  // }

  closeReqModal();
}

function donateFromRequest(request) {
  // const {userId,created,state} = selectedRequest
  const userId = localStorage.getItem("userId");
  const obj = {
    ...request,
    userId,
    // created,state
  };
  delete obj.id;
  console.log("obj (donateFromRequest)", obj);
  // const donationsRef = databaseRef.ref('donations');
  // donationsRef.push(obj)
  if (selectedRequest && selectedRequest.id) {
    databaseRef.ref("/requests/" + selectedRequest.id).set({
      ...selectedRequest,
      donerId: userId,
      state: "done",
    });
    window.alert("Donation Complete");
  }
  // closeReqModal()
}

function createDonation() {
  // const {userId,created,state} = selectedRequest
  const userId = localStorage.getItem("userId");
  const obj = {
    title: reqTitle.value,
    description: reqDes.value,
    image: requestImageUrl,
    type: reqType.value,
    userId,
    created: Date.now(),
    // created,state
  };
  console.log("obj obj obj ", obj);
  const donationsRef = databaseRef.ref("donations");
  donationsRef.push(obj);
  if (selectedRequest && selectedRequest.id) {
    databaseRef.ref("/requests/" + selectedRequest.id).set({
      ...selectedRequest,
      state: "done",
    });
    window.alert("Request Updated Successfully");
  }
  closeReqModal();
}

function updateDonation() {
  // const {userId,created,state} = selectedRequest
  const userId = localStorage.getItem("userId");
  const obj = {
    title: reqTitle.value,
    description: reqDes.value,
    image: requestImageUrl,
    type: reqType.value,
    userId,
    created: Date.now(),
    // created,state
  };
  console.log("obj obj obj ", obj);
  // const donationsRef = databaseRef.ref("donations");
  // donationsRef.push(obj);
  if (selectedDonation && selectedDonation.id) {
    databaseRef.ref("/donations/" + selectedDonation.id).set({
      ...obj
    });
    window.alert("Donation Updated Successfully");
  }
  closeReqModal();
}

function closeReqModal() {
  document.getElementById("closeRequestModal").click();
}
