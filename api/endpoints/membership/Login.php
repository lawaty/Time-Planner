<?php

class Login extends Endpoint
{
  public function __construct()
  {
    $this->init([
      'username' => [true, Regex::LOGIN],
      'password' => [true, Regex::LOGIN],
    ], $_POST);
  }

  public function handle(): Response
  {
    $user = UserMapper::get(['username' => $this->request['username']]);
    
    if (!$user || $user->get('password') != $this->request['password'])
      return new Response(UNAUTHORIZED, "Wrong username or password");

    return new Response(200, [
      'id' => $user->get('id'),
      'username' => $user->get('username'),
      'email' => $user->get('password'),
      'token' => Authenticated::getToken($user)
    ]);
  }
}
