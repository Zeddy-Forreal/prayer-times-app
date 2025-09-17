let city_button = document.querySelectorAll(".selectt")
let city_choices = document.querySelectorAll(".country_choices")
let searches = document.querySelectorAll(".input_container input");
let items = document.querySelectorAll(" li")

let country = document.querySelector(".countries .indicator")
let city = document.querySelector(".cities .indicator")
let times = document.querySelectorAll(".time")

city_button.forEach((but,ind)=>{

    but.onclick = ()=>{
    if(but.parentElement.classList.contains("active")){
        Dactive_it(but.parentElement)

    }else{
        active_it(but.parentElement)
    }
    
}
})


function active_it(elem){
    elem.classList.add("active")
}
function Dactive_it(elem){
    elem.classList.remove("active")
}

searches.forEach((search, ind)=>{
    search.oninput = ()=>{
        
        [...search.nextElementSibling.children].forEach((child)=>{
            if(!child.innerHTML.toLowerCase().includes(search.value.toLowerCase())){
                child.style.display = "none"
            }else{
                child.style.display = "block"
            }

            if(ind == 1){
                filter()
            }
        })
    }

})


let js = `

    --body: #353535;
    --color1: #1f180a;
    --color2: rgb(243, 230, 216);
    --color3: #515151;
    --dark_text: #ffc557;
    --light_text: #e0d3f7;
    --main_color: #ffc557;
    --t: 0.5s;
    --r: 1px;
    --sh: 1px 4px 6px rgba(0, 0, 0, 0.25);
    --w: 0.15rem;`

items.forEach((li)=>{
    li.onclick = ()=>{

        Dactive_it(li.parentElement.parentElement.parentElement)

        if(li.parentElement.classList.contains("countries")){
            country.innerHTML = li.innerHTML;
            document.querySelector(".cities").classList.remove('disabled')
            clear_cities()

        }else{
            city.innerHTML = li.innerHTML;
            searches[1].value = ""
            filter()
            insert_data(`https://api.aladhan.com/v1/timingsByCity?city=${city.innerHTML}&country=${country.innerHTML}&method=5`)
        }
    }
})



function clear_cities(){
    city.innerHTML = "City"
    searches[1].value = "";
    filter()
    times.forEach((time)=>{
        time.innerHTML = "--:-- -m"
    })

}

function filter(){
        [...searches[1].nextElementSibling.children].forEach((li)=>{
        li.style.display = li.getAttribute("data-country").toLowerCase() == country.innerHTML.toLowerCase() && li.innerHTML.toLowerCase().includes(searches[1].value.toLowerCase())? "block":"none"
    })
}

function insert_data(url){
    fetch(url).then(data => data.json()).then(data=>{
        timings = data.data.timings;
        prayers_times = [timings.Fajr, timings.Sunrise, timings.Dhuhr, timings.Asr, timings.Maghrib, timings.Isha]
        times.forEach((time, ind)=>{
            let [hrs,mins]= prayers_times[ind].split(":");
            let wet = "am"
            hrs = Number(hrs)
            if(hrs >=12){
                wet = "pm"
            }
            if(hrs > 12){
                hrs -= 12;

            }else if(hrs == 0){
                hrs = 12
            }

            if(hrs < 10){
                hrs = `0${hrs}`
            }
            let formatted = `${hrs}:${mins} ${wet}`
            time.innerHTML = formatted;
        })
    })
}