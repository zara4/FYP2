var firebaseConfig = {
  apiKey: "AIzaSyBtuRZ5LU1dxTvdFzvE35G5HxR1Nqb3fDs",
  authDomain: "naiki-4fdc1.firebaseapp.com",
  databaseURL: "https://naiki-4fdc1-default-rtdb.firebaseio.com",
  projectId: "naiki-4fdc1",
  storageBucket: "naiki-4fdc1.appspot.com",
  messagingSenderId: "1035653636265",
  appId: "1:1035653636265:web:096d2bbea55f84a8a3c9b8"
};

firebase.initializeApp(firebaseConfig);
var databaseRef = firebase.database();
var firstTime = 0;
function subscribeToRequests() {
  databaseRef
    .ref()
    .child("requests")
    .on("value", () => {
      if (firstTime === 1) {
        var myToast = Toastify({
          text: "New Donation Request",
          duration: 50000,
          onClick: function () {
            window.location.href = 'create-donation.html'
          }
        });
        myToast.showToast();
      }
      setTimeout(() => {
        firstTime = 1;
      }, 1000)
    });
}

const getDonations = () => {
  subscribeToRequests()
  renderMenu();
  renderPageContent();
  let values = []
  databaseRef.ref().child('donations').orderByChild("state").equalTo("pending").on('value', async (data) => {
    data.forEach((d) => {
      values.push({
        id: d.key,
        ...d.val()
      });
    })
    for (let item of values) {
      const user = await fetch(`https://naiki-4fdc1-default-rtdb.firebaseio.com/users/${item.userId}.json`);
      const finalUser = await user.json();
      item.user = finalUser
    }
    console.log(values);
    renderDonationCards(values);
  })

};

function renderPageContent() {
  const user = JSON.parse(localStorage.getItem("user"));
  let data = `<div class="desc">
    <h2>Our <strong>Donations</strong></h2>
    <span>HandCrafted by NAIKI Team</span>
    ${user.type === "Donee"
      ? `<span onclick="openRequestCreationModal()"><a class="btn btn-primary btn-lg"   >Request Donation</a></span>`
      : `<span><a class="btn btn-primary btn-lg" href="create-donation.html">Donate Now</a></span>`
    }
</div>`;
  console.log(data);
  document.getElementById("pageContent").innerHTML = data;
}

function renderMenu() {
  //   firstTime = 1;
  const user = JSON.parse(localStorage.getItem("user"));
  const data = `		<li>
    <a href="index.html">Home</a>
</li>

<li><a href="about.html">About</a></li>
${user.type === "Donee"
      ? `<li><a href="myRequests.html">My Requests</a></li>`
      : ""
    }
${user.type === "Donor"
      ? `<li><a href="myDonations.html">My Donations</a></li>`
      : ""
    }

<li><a href="profile.html">User
        <image src="images/user.jpg" width="45" height="35" />
    </a></li>`;

  document.getElementById("menu").innerHTML = data;
}

function openRequestCreationModal() {
  resetRequestDonationForm();
  document.getElementById("requestModalTrigger").click();
}

function renderDonationCards(donations) {
  const user = JSON.parse(localStorage.getItem("user"));

  let data = "";
  donations.forEach((donation, idx) => {
    data += `	<div class="col-lg-4 col-md-4 col-sm-6">
                            <div class="fh5co-blog ">
                                <a ><img class="img-responsive card-image" src="${donation.image !== "" ? donation.image : `images/no-image.png`}" alt=""></a>
                                <div class="blog-text">
                                    <div class="prod-title">
                                        <h3><a href="" #><b>${donation.title}</b></a></h3>
                                        <span class="posted_by">Posted by ${donation.user.name}</span>
                                        <span class="comment">${new Date(donation.created).getDate()}/${new Date(donation.created).getMonth()}/${new Date(donation.created).getFullYear()}</span>
                                        <p>${donation.description.length > 15 ? `${donation.description.substring(0, 15)}...` : donation.description}</p>
                                    </div>
                                    ${user.type === "Donee" ? `
                                    <div style="text-align:center">
                                    <span><a class="btn btn-primary btn-lg" href="">Get Donation</a></span>
                                    </div>
                                    `: ""}
                                </div>
                            </div>
                            </div>`;
  });
  document.getElementById("donationData").innerHTML = data;
}

var reqTitle = document.getElementById("r-title");
var reqDes = document.getElementById("r-des");
var reqType = document.getElementById("r-type");

var requestRef = databaseRef.ref("requests");

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

function resetRequestDonationForm() {
  requestImage.style.display = "none";
  requestImage.src = "";
  reqTitle.value = "";
  reqDes.value = "";
  reqType.value = "";
}

function submitRequest() {
  const obj = {
    title: reqTitle.value,
    description: reqDes.value,
    image: requestImageUrl,
    type: reqType.value,
    state: "pending",
    created: Date.now(),
    userId: localStorage.getItem("userId"),
  };

  console.log(obj);
  if (reqTitle.value !== "" && reqDes.value !== "" && reqType.value !== "") {
    requestRef.push(obj);
    closeReqModal();
  } else {
    window.alert("Please fill all required data!");
  }
}

function closeReqModal() {
  document.getElementById("closeRequestModal").click();
  resetRequestDonationForm();
}
