
jQuery(init);
function init($) {

    fetch("data.json")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            handleRequest(data);
        })
        .catch(function (error) {
            console.log(error);
        });

    let hotels;
    let filteredHotels = [];
    let roomTypes;
    let filtersArray = [];

    function handleRequest(data) {
        hotels = data[1].entries;
        roomTypes = data[0].roomtypes;
        sendCityListToSearchBar(hotels);
        sendRoomTypes(roomTypes);
        sendFilters(hotels);
    }

    //a function to inform dynamically the select tag with filters without duplicates
    function sendFilters(hotels) {
        hotels.forEach(function (hotel) {
            hotel.filters.forEach(function (item) {
                filtersArray.push(item.name);
            })
        })
        filtersArray = filtersArray.filter(removeDups);
        filtersArray.forEach(function (item) {
            const filterSelect = document.getElementById("filters");
            const template = `
                <option value="${item}">${item}</option>`;
            filterSelect.innerHTML += template;
        })
    }

    //a function to inform dynamically the datalist with cities without duplicates
    function sendCityListToSearchBar(hotels) {
        const cities = [];
        for (let i = 0; i < hotels.length; i++) {
            cities.push(hotels[i].city);
        }
        const nonDupsCities = cities.filter(removeDups);
        nonDupsCities.forEach(function (item) {
            const hotelDatalist = document.getElementById("hotels");
            const template = `
                <option value="${item}"></option>`;
            hotelDatalist.innerHTML += template;
        })
    }


    //a function to inform dynamically the select tag with room types
    function sendRoomTypes(roomTypes) {
        roomTypes.forEach(function (item) {
            const roomTypeSelect = document.getElementById("familyRoom");
            const template = `
                <option value="${item.name}">${item.name}</option>`;
            roomTypeSelect.innerHTML += template;
        })

    }


    //a function with all filter functions
    function filterTheHotels() {
        filterByCity();
        filterByPrice();
        filterByProperty();
        filterByGuestRating();
        filterBySort();
        document.getElementById("hotel_loop").innerHTML = "";//here i clear the innerHtml to display the new list
        filteredHotels.map(displayHotels);
    }

    function filterByCity() {
        filteredHotels = hotels.filter(function (hotel) {
            const selectedCity = document.getElementById("city_input").value;
            if (hotel.city === selectedCity) {
                return true;

            } else {
                return false;
            }
        });
        informMapModal();//we inform the modal with data after the filtering 
    }

    function filterByPrice() {
        const price = document.getElementById("customRange").value
        if (price != 2000) {
            filteredHotels = filteredHotels.filter(function (hotel) {
                if (hotel.price <= price) {
                    return true;

                } else {
                    return false;
                }
            });
        }
    }


    function filterByProperty() {
        const property = document.getElementById("property").value
        if (property != "") {
            filteredHotels = filteredHotels.filter(function (hotel) {
                if (hotel.rating == property) {
                    return true;

                } else {
                    return false;
                }
            });

        }
    }

    function filterByGuestRating() {
        const guestRating = document.getElementById("guestrating").value
        if (guestRating != "") {
            if (guestRating == 2) {
                guestRatingRangeFilter(-1, 2);
            } else if (guestRating == 6) {
                guestRatingRangeFilter(2, 6);
            } else if (guestRating == 7) {
                guestRatingRangeFilter(6, 7);
            } else if (guestRating == 8.5) {
                guestRatingRangeFilter(7, 8.5);
            } else if (guestRating == 10) {
                guestRatingRangeFilter(8.5, 10);
            }
        }


    }


    function guestRatingRangeFilter(min, max) {
        filteredHotels = filteredHotels.filter(function (hotel) {
            if (hotel.guestrating > min && hotel.guestrating <= max) {
                return true;
            } else {
                return false;
            }
        });
    }

    function filterBySort() {
        const filters = document.getElementById("filters").value
        if (filters != "") {
            filteredHotels = filteredHotels.filter(function (hotel) {
                if (hotel.filters.filter(e => e.name == filters).length > 0) {
                    return true;
                } else {
                    return false;
                }
            });

        }
    }

    //a function to send data into the map modal
    function informMapModal() {
        document.getElementById("modalHeading").innerHTML = filteredHotels[0].city;
        document.getElementById("iframe").src = filteredHotels[0].mapurl;
    }


    // a functon todisplay hotels accordingly to filters

    function displayHotels(hotel) {
        // hotel = entrie;
        const hotelRow = document.getElementById("hotel_loop");
        starRating(hotel.rating)
        const template = `
            <div class="row" id="hotelrow">
                <div class="col-4 border-right" id="imageDiv" >
                    <img src="${hotel.thumbnail}"   />
                </div>
                <div class="col-5 border-right  ">
                    <p>
                        <h3>${hotel.hotelName}</h3>
                    </p>
                    <p >
                        ${starRating(hotel.rating)} Hotel
                    </p><br><br>
                    <div >${hotel.ratings.no} ${hotel.ratings.text}</div>
                </div>
                <div class="col-3  id="priceDiv">                                      
                    <p id="priceIcon1"><i class="fas fa-dollar-sign " ></i>${hotel.price}</p>
                    <p id="priceIcon2">3 nights for ${hotel.price * 3}</p>   
                    <div class="row" id="offerBtn">   
                    <button class="btn btn-success btn-block" >View Deal</button></p>
                        </div>
                    </div>
            </div>`;
        hotelRow.innerHTML += template;
    }

    //a function to display rating stars
    function starRating(stars) {
        let starTemplate = ' ';
        for (i = 1; i <= stars; i++) {
            starTemplate += '<span class="fa fa-star checked"></span>';
        }
        if (stars < 5) {
            for (i = 1; i <= (5 - stars); i++) {
                starTemplate += '<span class="fa fa-star "></span>';
            }
        }
        return starTemplate;
    }

    //event listeners
    document.querySelector("form").addEventListener("submit", handleSubmit);

    function handleSubmit(event) {
        event.preventDefault();
        filterTheHotels();
    }


    $("select").change(function () {
        if ($("#city_input").val() !== "") {
            filterTheHotels()
        }
    });

    $("#customRange").change(function () {
        $("#price").text("Price " + $(this).val());
        if ($("#city_input").val() !== "") {
            filterTheHotels();
        }
    });


    //local date to format dd/mm/yyyy
    let today = new Date(),
        day = today.getDate(),
        month = today.getMonth() + 1, //January is 0
        year = today.getFullYear();
    if (day < 10) {
        day = '0' + day
    }
    if (month < 10) {
        month = '0' + month
    }
    today = day + '/' + month + '/' + year;





    //datepicker functions
    $('#checkin').datepicker({
        uiLibrary: 'bootstrap4',
        format: 'dd/mm/yyyy',
        minDate: today

    });

    $('#checkout').datepicker({
        uiLibrary: 'bootstrap4',
        format: 'dd/mm/yyyy',
        minDate: today
    });

    // document.getElementById('checkin').addEventListener('change',skata)
    // function skata(event){
    //     event.preventDefault();
    //     console.log("adasd")
    // }

    //function for duplicates
    function removeDups(value, idx, arr) {
        return idx === arr.indexOf(value);
    }
}