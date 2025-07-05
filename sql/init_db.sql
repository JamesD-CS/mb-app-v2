
CREATE TABLE IF NOT EXISTS forums (
  forum_id SERIAL PRIMARY KEY,
  forum_name varchar(250) NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  post_id SERIAL PRIMARY KEY,
  forum_id int,
  title varchar (250),
  body text,
  poster_id uuid UNIQUE,  
  post_time timestamp DEFAULT now(),
  parent_post_id uuid REFERENCES posts(poster_id) ON DELETE CASCADE,
  CONSTRAINT fk_forum_id
  FOREIGN KEY(forum_id)
  REFERENCES forums(forum_id)
);

INSERT INTO forums (forum_name)
VALUES ('General'),
       ( 'Music'),
       ('Movies'),
       ('TV'),
       ('Games');
       
INSERT INTO posts (forum_id, title, body, poster_id, post_time)
VALUES (1, 'test post', 'This is a test post', '363220b5-d17a-467c-b231-abcb8a408042', '2004-10-19 10:23:54'),
       (1, 'test post 2', 'This is another test post', 'be59e1ec-5583-46ee-959f-e5236bfe900f', '2004-10-19 10:23:54'),
       (2, 'test post 3', 'This is a test post', '420b2437-2500-4655-bb2e-20c2cd9267c6', '2004-10-19 10:23:54'),
       (2, 'test post 4', 'This is a test post', '6e5acc79-5344-4de6-b85f-964df9128d81', '2004-10-19 10:23:54');

