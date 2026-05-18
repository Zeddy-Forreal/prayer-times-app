const COUNTRIES = ["Algeria","Bahrain","Comoros","Djibouti","Egypt","Iraq","Jordan","Kuwait","Lebanon","Libya","Mauritania","Morocco","Oman","Palestine","Qatar","Saudi Arabia","Somalia","Sudan","Syria","Tunisia","United Arab Emirates","Yemen"];
const CITIES = {
  Algeria:["Algiers","Oran","Constantine"],
  Bahrain:["Manama","Muharraq"],
  Comoros:["Moroni"],
  Djibouti:["Djibouti"],
  Egypt:["Cairo","Alexandria","Giza","Shubra El-Kheima"],
  Iraq:["Baghdad","Basra","Mosul"],
  Jordan:["Amman","Zarqa"],
  Kuwait:["Kuwait City"],
  Lebanon:["Beirut","Tripoli"],
  Libya:["Tripoli","Benghazi"],
  Mauritania:["Nouakchott"],
  Morocco:["Casablanca","Rabat","Marrakesh"],
  Oman:["Muscat","Salalah"],
  Palestine:["Gaza","Hebron"],
  Qatar:["Doha"],
  "Saudi Arabia":["Riyadh","Jeddah","Mecca","Medina","Dammam"],
  Somalia:["Mogadishu"],
  Sudan:["Khartoum","Omdurman"],
  Syria:["Damascus","Aleppo"],
  Tunisia:["Tunis","Sfax"],
  "United Arab Emirates":["Dubai","Abu Dhabi","Sharjah"],
  Yemen:["Sana'a","Aden"]
};

const PRAYER_IDS = ['fajr','sunrise','dhuhr','asr','maghrib','isha'];
const PRAYER_KEYS = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];

let selectedCountry = null, selectedCity = null;

// Date display
const now = new Date();
document.getElementById('dateDisplay').textContent =
  now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

// Populate
const countryList = document.getElementById('countryList');
COUNTRIES.forEach(c => {
  const li = document.createElement('li');
  li.textContent = c; li.dataset.value = c; li.classList.add('visible');
  countryList.appendChild(li);
});

function buildCities(country) {
  const cityList = document.getElementById('cityList');
  cityList.innerHTML = '';
  (CITIES[country]||[]).forEach(city => {
    const li = document.createElement('li');
    li.textContent = city; li.dataset.value = city; li.classList.add('visible');
    cityList.appendChild(li);
  });
}

// Dropdown toggle
function openDropdown(btnId, dropId) {
  const btn = document.getElementById(btnId);
  const drop = document.getElementById(dropId);
  const isOpen = drop.classList.contains('open');
  closeAll();
  if (!isOpen) {
    drop.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded','true');
  }
}
function closeAll() {
  ['countryDropdown','cityDropdown'].forEach(id => {
    const d = document.getElementById(id);
    d.classList.remove('open');
  });
  ['countryBtn','cityBtn'].forEach(id => {
    const b = document.getElementById(id);
    b.classList.remove('open');
    b.setAttribute('aria-expanded','false');
  });
}
document.addEventListener('click', e => {
  if (!e.target.closest('.selector-wrap')) closeAll();
});

document.getElementById('countryBtn').addEventListener('click', e => {
  e.stopPropagation();
  openDropdown('countryBtn','countryDropdown');
});
document.getElementById('cityBtn').addEventListener('click', e => {
  e.stopPropagation();
  openDropdown('cityBtn','cityDropdown');
});

// Search filter
document.getElementById('countrySearch').addEventListener('input', function() {
  const val = this.value.toLowerCase();
  countryList.querySelectorAll('li').forEach(li => {
    li.classList.toggle('visible', li.textContent.toLowerCase().includes(val));
  });
});
document.getElementById('citySearch').addEventListener('input', function() {
  const val = this.value.toLowerCase();
  document.getElementById('cityList').querySelectorAll('li').forEach(li => {
    li.classList.toggle('visible', li.textContent.toLowerCase().includes(val));
  });
});

// Select handlers
countryList.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  selectedCountry = li.dataset.value;
  selectedCity = null;

  document.getElementById('countryBtnText').textContent = selectedCountry;
  document.getElementById('countryBtnText').classList.add('selected');
  countryList.querySelectorAll('li').forEach(l => l.classList.remove('active-item'));
  li.classList.add('active-item');

  document.getElementById('cityBtnText').textContent = 'Select city';
  document.getElementById('cityBtnText').classList.remove('selected');
  document.getElementById('cityWrap').classList.remove('disabled');
  document.getElementById('citySearch').value = '';

  buildCities(selectedCountry);
  resetTimes();
  closeAll();
});

document.getElementById('cityList').addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  selectedCity = li.dataset.value;

  document.getElementById('cityBtnText').textContent = selectedCity;
  document.getElementById('cityBtnText').classList.add('selected');
  document.getElementById('cityList').querySelectorAll('li').forEach(l => l.classList.remove('active-item'));
  li.classList.add('active-item');
  document.getElementById('citySearch').value = '';

  closeAll();
  fetchTimes();
});

function resetTimes() {
  PRAYER_IDS.forEach(id => {
    const t = document.getElementById('time-' + id);
    t.textContent = '--:--';
    t.classList.remove('loaded','loading');
    document.getElementById('card-' + id).classList.remove('current');
  });
}

function setLoading() {
  PRAYER_IDS.forEach(id => {
    const t = document.getElementById('time-' + id);
    t.textContent = '⋯';
    t.classList.add('loading');
    t.classList.remove('loaded');
  });
}

function fetchTimes() {
  if (!selectedCountry || !selectedCity) return;
  setLoading();
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(selectedCity)}&country=${encodeURIComponent(selectedCountry)}&method=5`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      const t = data.data.timings;
      const raw = [t.Fajr, t.Sunrise, t.Dhuhr, t.Asr, t.Maghrib, t.Isha];
      const minutesNow = now.getHours()*60 + now.getMinutes();

      // find current prayer
      const minutes = raw.map(str => {
        const [h,m] = str.split(':').map(Number);
        return h*60+m;
      });
      let currentIdx = -1;
      for (let i = minutes.length-1; i >= 0; i--) {
        if (minutesNow >= minutes[i]) { currentIdx = i; break; }
      }

      PRAYER_IDS.forEach((id, i) => {
        const el = document.getElementById('time-' + id);
        const card = document.getElementById('card-' + id);
        el.classList.remove('loading');

        let [hrs,mins] = raw[i].split(':');
        hrs = Number(hrs);
        const ampm = hrs >= 12 ? 'pm' : 'am';
        if (hrs > 12) hrs -= 12;
        else if (hrs === 0) hrs = 12;
        const hStr = hrs < 10 ? '0'+hrs : ''+hrs;

        el.textContent = `${hStr}:${mins} ${ampm}`;
        el.classList.add('loaded');

        card.classList.toggle('current', i === currentIdx);
      });
    })
    .catch(() => {
      PRAYER_IDS.forEach(id => {
        const t = document.getElementById('time-' + id);
        t.textContent = 'Error';
        t.classList.remove('loading');
      });
    });
}
