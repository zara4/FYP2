
var uname = document.getElementById('uname');
var cnic = document.getElementById('cnic');
var gender = document.getElementById('gender');
var phone = document.getElementById('phone');
var country = document.getElementById('country');
var city = document.getElementById('city');
var email = document.getElementById('email');
var address = document.getElementById('address');
var uploadBtnName = document.getElementById('uploadBtnName')
var profileImageAfterUpload;
var userId;

const validateUser = () => {
    const user = localStorage.getItem('userId');
    userId = user;
    if (!user) {
        window.location.href = 'login.html'
    } else {
        fetchUserProfile(user)
    }
}
var firebaseConfig = {
    apiKey: "AIzaSyDp48jRaC7z8wGIQgsf79xgAbe95MGfzYs",
    authDomain: "naiki-b125a.firebaseapp.com",
    databaseURL: "https://naiki-b125a-default-rtdb.firebaseio.com",
    projectId: "naiki-b125a",
    storageBucket: "naiki-b125a.appspot.com",
    messagingSenderId: "801406744708",
    appId: "1:801406744708:web:cb16690ad33801f06e2ad1",
    measurementId: "G-M9W4N24FJ5"
  };

firebase.initializeApp(firebaseConfig);
var databaseRef = firebase.database();
var userRef = databaseRef.ref('users')

const uploadImageRef = document.getElementById('uploadProfileImage');
const progressBar = document.getElementById('progressBar');
const uploadinStatus = document.getElementById('uploading-status');
const profileImage = document.getElementById('profile-image');
const updateProfile = document.getElementById('updateProfile')
progressBar.style.display = 'none';
uploadImageRef.addEventListener('change', (e) => {
    uploadinStatus.innerText = "uploading..."
    progressBar.style.display = 'block';
    progressBar.value = 20;
    const ref = firebase.storage().ref();
    let file = e.target.files[0];
    const name = (+new Date()) + '-' + file.name;
    const metadata = {
        contentType: file.type
    };
    const fileRef = ref.child(name)
    const task = fileRef.put(file, metadata);
    task.on('state_changed',
        function progress(snapshot) { //progress
            let per = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.value = per;
        },
        function error(error) {
            console.log(error);
            uploadinStatus.innerText = error;
            uploadinStatus.style.color = 'red';
        },
        function complete() {
            uploadinStatus.innerText = "Profile image uploaded successfully !";
            uploadinStatus.style.color = 'green';
            fileRef.getDownloadURL()
                .then((url) => {
                    userRef.child(userId).child("image").set(url)
                    profileImage.src = url;
                    profileImageAfterUpload = url
                })
        }
    )
})


updateProfile.addEventListener('click', () => {
    if(!profileImageAfterUpload){
        profileImageAfterUpload = ""
    }
    const finalObject = {
        name: uname.value,
        cnic: cnic.value,
        gender: gender.value,
        phone: phone.value,
        country: country.value,
        city: city.value,
        email: email.value,
        address: address.value,
        image: profileImageAfterUpload
    }
    userRef.child(userId).set(finalObject)
	window.alert("Profile Edited Successfully");
})

const fetchUserProfile = (userId) => {
    fetch(`https://naiki-b125a-default-rtdb.firebaseio.com/users/${userId}.json`).then(response => response.json())
        .then(data => {
            populateProfileData(data)
        })
}

const populateProfileData = (profileData) => {
    console.log(profileData);
    uname.value = profileData.name;
    email.value = profileData.email;
    cnic.value = profileData.cnic;
    gender.value = profileData.gender;
    phone.value = profileData.phone;
    country.value = profileData.country;
    city.value = profileData.city;
    address.value = profileData.address;
    if (profileData.image !== "") {
        uploadBtnName.innerText = "Update Profile Image"
        profileImage.src = profileData.image;
        profileImageAfterUpload = profileData.image
    } else {
        uploadBtnName.innerText = "Upload Profile Image"
        profileImage.src = 'images/user.jpg'
    }

}


