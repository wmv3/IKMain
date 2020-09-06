drop table IF EXISTS users;
CREATE TABLE users (
    userid        UUID         PRIMARY KEY,
    fname         VARCHAR(100) NOT NULL,
    lname         VARCHAR(100)  NOT NULL,
	street        VARCHAR(255)  ,
	city          VARCHAR(255)  ,
	state         varchar(2)    ,
	zip           varchar(5)    ,
	email         varchar(100)  , 
    date_of_birth DATE          ,
    phone  VARCHAR(10) 
);