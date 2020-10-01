# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Features
- Create a short url which redirects to a long url
- See all short urls created, in a list
- Track date created, total visits and unique visits of each short url
- List all visits (with date and visitor) on the specific page for each short url (page only accessible by creator)

## Final Product

!["Screenshot of login page"](https://github.com/marcelloak/tinyapp/blob/master/docs/login-page.png)
!["Screenshot of urls page"](https://github.com/marcelloak/tinyapp/blob/master/docs/urls-page.png)
!["Screenshot of url page"](https://github.com/marcelloak/tinyapp/blob/master/docs/url-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Access the server from your [local host](http://localhost:8080).