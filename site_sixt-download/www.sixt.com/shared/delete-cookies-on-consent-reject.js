function listCookies() {
    return document.cookie.split(';').map(function(cookieDetails) {
      return cookieDetails.split('=')[0].trim()
    });
}

function deleteCookie(name) {
    var domain = window.location.hostname;
    var allPossibleDomains = [domain];
    while(domain.indexOf('.') >= 0) {
        domain = domain.substring(domain.indexOf('.') + 1)
        allPossibleDomains.push(domain);
        
    }
    allPossibleDomains.forEach(function(domainName) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=' + domainName;
    })
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
}


function handleUcChange(event) {
    var allCategories = event.detail.ucCategory;
    var areAllCategoriesConsent = Object.keys(allCategories)
        .map(function(key) {return allCategories[key]})
        .every(Boolean);

    if (!areAllCategoriesConsent) {
        var regexToExcludeCookieDeletion = /(sx_)|(optimizely)/
        var cookies = listCookies().filter(function(cookie) { return !regexToExcludeCookieDeletion.test(cookie)});
        if (cookies && cookies.length !== 0) {
            cookies.forEach(function(cookie) { 
                deleteCookie(cookie);
            });
        }
    }
}

(function(){
    window.removeEventListener('ucEvent', handleUcChange);
    window.addEventListener('ucEvent', handleUcChange);
})();
