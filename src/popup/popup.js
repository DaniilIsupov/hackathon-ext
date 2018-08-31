$(document).ready(function () {
  chrome.storage.sync.get('films', function (items) {
    for (let i = 0; i < items.films.films.length; i++) {
      let div = document.createElement("div");
      div.className = "item" + i + " hider";
      div.textContent = items.films.films[i].title;
      $(".container").append(div);
      for (let j = 0; j < items.films.films[i].cinema.length; j++) {
        let div = document.createElement("div");
        div.className = "ci" + i + j + " hidden";
        div.textContent = items.films.films[i].cinema[j].name;
        $(".item" + i).append(div);
      }
    }
  });
  // $(".hider").click(function () {
  //   $(".hidden").toggle("slow");
  //   console.log('123');
  // });
  $(document).on('click', '.hider', function () {
    //$(".hidden").toggle("slow");
    $(this).children().toggle("slow");
  });
});