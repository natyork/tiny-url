myObj = {
  key1: {
    id: "sddfk2",
    un: "blarp",
    pw: "fart"
  },
  key2: {
    id: "sddas2",
    un: "narp",
    pw: "neep"
  },
  key3: {
    id: "sdsdf2",
    un: "choose",
    pw: "cheese"
  }
};

for (key in myObj) {
  if (myObj[key].un == "narp"){
    console.log("match");
  }
  else {
    console.log("no match");
  }
}