// Simple localStorage-based Birthday Patro
let birthdays = JSON.parse(localStorage.getItem('birthdays')||'[]');

function save(){localStorage.setItem('birthdays',JSON.stringify(birthdays));render();}

// VERY simplified BS->AD mock (placeholder accurate range needed)
function bsToAd(y,m,d){return {y:y-57,m:m,d:d};}

function render(){
 const list=document.getElementById('birthdayList');list.innerHTML='';
 birthdays.forEach((b,i)=>{
  const div=document.createElement('div');div.className='birthday-item';
  div.innerHTML=`<strong>${b.name}</strong> (${b.bs.y}-${b.bs.m}-${b.bs.d})<br>
  AD: ${b.ad.y}-${b.ad.m}-${b.ad.d}<br>
  <button onclick="del(${i})">Delete</button>`;
  list.appendChild(div);
 });
}

function del(i){birthdays.splice(i,1);save();}

document.getElementById('birthdayForm').onsubmit=e=>{
 e.preventDefault();
 const name=document.getElementById('name').value;
 const bs={y:+bsYear.value,m:+bsMonth.value,d:+bsDay.value};
 const ad=bsToAd(bs.y,bs.m,bs.d);
 birthdays.push({name,bs,ad});
 save();
 e.target.reset();
};

render();

// Placeholder sync functions
function signInWithGoogle(){alert('Coming soon');}
function signInWithApple(){alert('Coming soon');}
function signInWithEmail(){alert('Coming soon');}
function syncToCloud(){alert('Coming soon');}
function loadFromCloud(){alert('Coming soon');}
