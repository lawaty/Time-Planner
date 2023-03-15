<?php

class Ndate extends DateTime
{
  const DATE_TIME = "Y-m-d H:i";
  const DATE = "Y-m-d";
  const TIME = "H:i:s";
  
  public function __construct(string $date = 'now')
  {
    parent::__construct($date);
  }

  public static function now($format = self::DATE): string
  {
    return (new Ndate())->toString($format);
  }

  public static function minutesUntil(Ndate $date): int
  {
    return self::secondsUntil($date) / 60;
  }

  public static function secondsUntil(Ndate $date): int
  {
    $diff = (new Ndate())->diff($date);
    $seconds = $diff->days * 24 * 3600 + $diff->h * 3600 + $diff->i * 60 + $diff->s;
    if(self::now() > $date)
      return $seconds * -1;

    return $seconds;
  }

  public function toMinutes(): int
  {
    return $this->getHours() * 60 + $this->getMinutes();
  }

  public function getHours(): string
  {
    return $this->format('H');
  }

  public function getMinutes(): string
  {
    return $this->format('i');
  }

  public function getSeconds(): string
  {
    return $this->format('s');
  }

  public function getDay(): string
  {
    return $this->format('D');
  }

  public function getMonth(): string
  {
    return $this->format('m');
  }

  public function getDate(): string
  {
    return $this->format(self::DATE);
  }

  public function toString($format = self::DATE_TIME): string
  {
    return $this->format($format);
  }
}
