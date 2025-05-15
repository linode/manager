/* This file borrowed from https://github.com/vahnag/react-timezone */
/* Timezones are borrowed from Google Calendar */

// [...$0.children].map(el => ({ label: (el.getAttribute('aria-label')|| '').replace(/\(.*?\)(.+)/, '$1').trim(), name: el.getAttribute('data-value'), offset: +(el.getAttribute('aria-label')|| '').replace(/\(.*?(-?[0-9]{2}):([0-9]{2})\).*/, (all, one, two) => +one + (two / 60) * (one > 0 ? 1 : -1)) }))

export const timezones = [
  {
    label: 'Niue Time',
    name: 'Pacific/Niue',
    offset: -11,
  },
  {
    label: 'Samoa Standard Time',
    name: 'Pacific/Pago_Pago',
    offset: -11,
  },
  {
    label: 'Cook Islands Standard Time',
    name: 'Pacific/Rarotonga',
    offset: -10,
  },
  {
    label: 'Hawaii-Aleutian Standard Time',
    name: 'Pacific/Honolulu',
    offset: -10,
  },
  {
    label: 'Hawaii-Aleutian Time',
    name: 'America/Adak',
    offset: -10,
  },
  {
    label: 'Tahiti Time',
    name: 'Pacific/Tahiti',
    offset: -10,
  },
  {
    label: 'Marquesas Time',
    name: 'Pacific/Marquesas',
    offset: -9.5,
  },
  {
    label: 'Alaska Time - Anchorage',
    name: 'America/Anchorage',
    offset: -9,
  },
  {
    label: 'Alaska Time - Juneau',
    name: 'America/Juneau',
    offset: -9,
  },
  {
    label: 'Alaska Time - Nome',
    name: 'America/Nome',
    offset: -9,
  },
  {
    label: 'Alaska Time - Sitka',
    name: 'America/Sitka',
    offset: -9,
  },
  {
    label: 'Alaska Time - Yakutat',
    name: 'America/Yakutat',
    offset: -9,
  },
  {
    label: 'Gambier Time',
    name: 'Pacific/Gambier',
    offset: -9,
  },
  {
    label: 'Pacific Time - Dawson',
    name: 'America/Dawson',
    offset: -8,
  },
  {
    label: 'Pacific Time - Los Angeles',
    name: 'America/Los_Angeles',
    offset: -8,
  },
  {
    label: 'Pacific Time - Metlakatla',
    name: 'America/Metlakatla',
    offset: -8,
  },
  {
    label: 'Pacific Time - Tijuana',
    name: 'America/Tijuana',
    offset: -8,
  },
  {
    label: 'Pacific Time - Vancouver',
    name: 'America/Vancouver',
    offset: -8,
  },
  {
    label: 'Pacific Time - Whitehorse',
    name: 'America/Whitehorse',
    offset: -8,
  },
  {
    label: 'Pitcairn Time',
    name: 'Pacific/Pitcairn',
    offset: -8,
  },
  {
    label: 'Mexican Pacific Standard Time',
    name: 'America/Hermosillo',
    offset: -7,
  },
  {
    label: 'Mexican Pacific Time - Chihuahua',
    name: 'America/Chihuahua',
    offset: -7,
  },
  {
    label: 'Mexican Pacific Time - Mazatlan',
    name: 'America/Mazatlan',
    offset: -7,
  },
  {
    label: 'Mountain Standard Time - Creston',
    name: 'America/Creston',
    offset: -7,
  },
  {
    label: 'Mountain Standard Time - Dawson Creek',
    name: 'America/Dawson_Creek',
    offset: -7,
  },
  {
    label: 'Mountain Standard Time - Fort Nelson',
    name: 'America/Fort_Nelson',
    offset: -7,
  },
  {
    label: 'Mountain Standard Time - Phoenix',
    name: 'America/Phoenix',
    offset: -7,
  },
  {
    label: 'Mountain Time - Boise',
    name: 'America/Boise',
    offset: -7,
  },
  {
    label: 'Mountain Time - Cambridge Bay',
    name: 'America/Cambridge_Bay',
    offset: -7,
  },
  {
    label: 'Mountain Time - Denver',
    name: 'America/Denver',
    offset: -7,
  },
  {
    label: 'Mountain Time - Edmonton',
    name: 'America/Edmonton',
    offset: -7,
  },
  {
    label: 'Mountain Time - Inuvik',
    name: 'America/Inuvik',
    offset: -7,
  },
  {
    label: 'Mountain Time - Ojinaga',
    name: 'America/Ojinaga',
    offset: -7,
  },
  {
    label: 'Mountain Time - Yellowknife',
    name: 'America/Yellowknife',
    offset: -7,
  },
  {
    label: 'Central Standard Time - Belize',
    name: 'America/Belize',
    offset: -6,
  },
  {
    label: 'Central Standard Time - Costa Rica',
    name: 'America/Costa_Rica',
    offset: -6,
  },
  {
    label: 'Central Standard Time - El Salvador',
    name: 'America/El_Salvador',
    offset: -6,
  },
  {
    label: 'Central Standard Time - Guatemala',
    name: 'America/Guatemala',
    offset: -6,
  },
  {
    label: 'Central Standard Time - Managua',
    name: 'America/Managua',
    offset: -6,
  },
  {
    label: 'Central Standard Time - Regina',
    name: 'America/Regina',
    offset: -6,
  },
  {
    label: 'Central Standard Time - Swift Current',
    name: 'America/Swift_Current',
    offset: -6,
  },
  {
    label: 'Central Standard Time - Tegucigalpa',
    name: 'America/Tegucigalpa',
    offset: -6,
  },
  {
    label: 'Central Time - Bahia Banderas',
    name: 'America/Bahia_Banderas',
    offset: -6,
  },
  {
    label: 'Central Time - Beulah, North Dakota',
    name: 'America/North_Dakota/Beulah',
    offset: -6,
  },
  {
    label: 'Central Time - Center, North Dakota',
    name: 'America/North_Dakota/Center',
    offset: -6,
  },
  {
    label: 'Central Time - Chicago',
    name: 'America/Chicago',
    offset: -6,
  },
  {
    label: 'Central Time - Knox, Indiana',
    name: 'America/Indiana/Knox',
    offset: -6,
  },
  {
    label: 'Central Time - Matamoros',
    name: 'America/Matamoros',
    offset: -6,
  },
  {
    label: 'Central Time - Menominee',
    name: 'America/Menominee',
    offset: -6,
  },
  {
    label: 'Central Time - Merida',
    name: 'America/Merida',
    offset: -6,
  },
  {
    label: 'Central Time - Mexico City',
    name: 'America/Mexico_City',
    offset: -6,
  },
  {
    label: 'Central Time - Monterrey',
    name: 'America/Monterrey',
    offset: -6,
  },
  {
    label: 'Central Time - New Salem, North Dakota',
    name: 'America/North_Dakota/New_Salem',
    offset: -6,
  },
  {
    label: 'Central Time - Rainy River',
    name: 'America/Rainy_River',
    offset: -6,
  },
  {
    label: 'Central Time - Rankin Inlet',
    name: 'America/Rankin_Inlet',
    offset: -6,
  },
  {
    label: 'Central Time - Resolute',
    name: 'America/Resolute',
    offset: -6,
  },
  {
    label: 'Central Time - Tell City, Indiana',
    name: 'America/Indiana/Tell_City',
    offset: -6,
  },
  {
    label: 'Central Time - Winnipeg',
    name: 'America/Winnipeg',
    offset: -6,
  },
  {
    label: 'Galapagos Time',
    name: 'Pacific/Galapagos',
    offset: -6,
  },
  {
    label: 'Acre Standard Time - Eirunepe',
    name: 'America/Eirunepe',
    offset: -5,
  },
  {
    label: 'Acre Standard Time - Rio Branco',
    name: 'America/Rio_Branco',
    offset: -5,
  },
  {
    label: 'Colombia Standard Time',
    name: 'America/Bogota',
    offset: -5,
  },
  {
    label: 'Cuba Time',
    name: 'America/Havana',
    offset: -5,
  },
  {
    label: 'Easter Island Time',
    name: 'Pacific/Easter',
    offset: -5,
  },
  {
    label: 'Eastern Standard Time - Atikokan',
    name: 'America/Atikokan',
    offset: -5,
  },
  {
    label: 'Eastern Standard Time - Cancun',
    name: 'America/Cancun',
    offset: -5,
  },
  {
    label: 'Eastern Standard Time - Jamaica',
    name: 'America/Jamaica',
    offset: -5,
  },
  {
    label: 'Eastern Standard Time - Panama',
    name: 'America/Panama',
    offset: -5,
  },
  {
    label: 'Eastern Time - Detroit',
    name: 'America/Detroit',
    offset: -5,
  },
  {
    label: 'Eastern Time - Grand Turk',
    name: 'America/Grand_Turk',
    offset: -5,
  },
  {
    label: 'Eastern Time - Indianapolis',
    name: 'America/Indiana/Indianapolis',
    offset: -5,
  },
  {
    label: 'Eastern Time - Iqaluit',
    name: 'America/Iqaluit',
    offset: -5,
  },
  {
    label: 'Eastern Time - Louisville',
    name: 'America/Kentucky/Louisville',
    offset: -5,
  },
  {
    label: 'Eastern Time - Marengo, Indiana',
    name: 'America/Indiana/Marengo',
    offset: -5,
  },
  {
    label: 'Eastern Time - Monticello, Kentucky',
    name: 'America/Kentucky/Monticello',
    offset: -5,
  },
  {
    label: 'Eastern Time - Nassau',
    name: 'America/Nassau',
    offset: -5,
  },
  {
    label: 'Eastern Time - New York',
    name: 'America/New_York',
    offset: -5,
  },
  {
    label: 'Eastern Time - Nipigon',
    name: 'America/Nipigon',
    offset: -5,
  },
  {
    label: 'Eastern Time - Pangnirtung',
    name: 'America/Pangnirtung',
    offset: -5,
  },
  {
    label: 'Eastern Time - Petersburg, Indiana',
    name: 'America/Indiana/Petersburg',
    offset: -5,
  },
  {
    label: 'Eastern Time - Port-au-Prince',
    name: 'America/Port-au-Prince',
    offset: -5,
  },
  {
    label: 'Eastern Time - Thunder Bay',
    name: 'America/Thunder_Bay',
    offset: -5,
  },
  {
    label: 'Eastern Time - Toronto',
    name: 'America/Toronto',
    offset: -5,
  },
  {
    label: 'Eastern Time - Vevay, Indiana',
    name: 'America/Indiana/Vevay',
    offset: -5,
  },
  {
    label: 'Eastern Time - Vincennes, Indiana',
    name: 'America/Indiana/Vincennes',
    offset: -5,
  },
  {
    label: 'Eastern Time - Winamac, Indiana',
    name: 'America/Indiana/Winamac',
    offset: -5,
  },
  {
    label: 'Ecuador Time',
    name: 'America/Guayaquil',
    offset: -5,
  },
  {
    label: 'Peru Standard Time',
    name: 'America/Lima',
    offset: -5,
  },
  {
    label: 'Amazon Standard Time - Boa Vista',
    name: 'America/Boa_Vista',
    offset: -4,
  },
  {
    label: 'Amazon Standard Time - Manaus',
    name: 'America/Manaus',
    offset: -4,
  },
  {
    label: 'Amazon Standard Time - Porto Velho',
    name: 'America/Porto_Velho',
    offset: -4,
  },
  {
    label: 'Atlantic Standard Time - Barbados',
    name: 'America/Barbados',
    offset: -4,
  },
  {
    label: 'Atlantic Standard Time - Blanc-Sablon',
    name: 'America/Blanc-Sablon',
    offset: -4,
  },
  {
    label: 'Atlantic Standard Time - Curaçao',
    name: 'America/Curacao',
    offset: -4,
  },
  {
    label: 'Atlantic Standard Time - Martinique',
    name: 'America/Martinique',
    offset: -4,
  },
  {
    label: 'Atlantic Standard Time - Port of Spain',
    name: 'America/Port_of_Spain',
    offset: -4,
  },
  {
    label: 'Atlantic Standard Time - Puerto Rico',
    name: 'America/Puerto_Rico',
    offset: -4,
  },
  {
    label: 'Atlantic Standard Time - Santo Domingo',
    name: 'America/Santo_Domingo',
    offset: -4,
  },
  {
    label: 'Atlantic Time - Bermuda',
    name: 'Atlantic/Bermuda',
    offset: -4,
  },
  {
    label: 'Atlantic Time - Glace Bay',
    name: 'America/Glace_Bay',
    offset: -4,
  },
  {
    label: 'Atlantic Time - Goose Bay',
    name: 'America/Goose_Bay',
    offset: -4,
  },
  {
    label: 'Atlantic Time - Halifax',
    name: 'America/Halifax',
    offset: -4,
  },
  {
    label: 'Atlantic Time - Moncton',
    name: 'America/Moncton',
    offset: -4,
  },
  {
    label: 'Atlantic Time - Thule',
    name: 'America/Thule',
    offset: -4,
  },
  {
    label: 'Bolivia Time',
    name: 'America/La_Paz',
    offset: -4,
  },
  {
    label: 'Guyana Time',
    name: 'America/Guyana',
    offset: -4,
  },
  {
    label: 'Venezuela Time',
    name: 'America/Caracas',
    offset: -4,
  },
  {
    label: 'Newfoundland Time',
    name: 'America/St_Johns',
    offset: -3.5,
  },
  {
    label: 'Amazon Time (Campo Grande)',
    name: 'America/Campo_Grande',
    offset: -3,
  },
  {
    label: 'Amazon Time (Cuiaba)',
    name: 'America/Cuiaba',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Buenos Aires',
    name: 'America/Argentina/Buenos_Aires',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Catamarca',
    name: 'America/Argentina/Catamarca',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Cordoba',
    name: 'America/Argentina/Cordoba',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Jujuy',
    name: 'America/Argentina/Jujuy',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - La Rioja',
    name: 'America/Argentina/La_Rioja',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Mendoza',
    name: 'America/Argentina/Mendoza',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Rio Gallegos',
    name: 'America/Argentina/Rio_Gallegos',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Salta',
    name: 'America/Argentina/Salta',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - San Juan',
    name: 'America/Argentina/San_Juan',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Tucuman',
    name: 'America/Argentina/Tucuman',
    offset: -3,
  },
  {
    label: 'Argentina Standard Time - Ushuaia',
    name: 'America/Argentina/Ushuaia',
    offset: -3,
  },
  {
    label: 'Brasilia Standard Time - Araguaina',
    name: 'America/Araguaina',
    offset: -3,
  },
  {
    label: 'Brasilia Standard Time - Bahia',
    name: 'America/Bahia',
    offset: -3,
  },
  {
    label: 'Brasilia Standard Time - Belem',
    name: 'America/Belem',
    offset: -3,
  },
  {
    label: 'Brasilia Standard Time - Fortaleza',
    name: 'America/Fortaleza',
    offset: -3,
  },
  {
    label: 'Brasilia Standard Time - Maceio',
    name: 'America/Maceio',
    offset: -3,
  },
  {
    label: 'Brasilia Standard Time - Recife',
    name: 'America/Recife',
    offset: -3,
  },
  {
    label: 'Brasilia Standard Time - Santarem',
    name: 'America/Santarem',
    offset: -3,
  },
  {
    label: 'Chile Time',
    name: 'America/Santiago',
    offset: -3,
  },
  {
    label: 'Falkland Islands Standard Time',
    name: 'Atlantic/Stanley',
    offset: -3,
  },
  {
    label: 'French Guiana Time',
    name: 'America/Cayenne',
    offset: -3,
  },
  {
    label: 'Palmer Time',
    name: 'Antarctica/Palmer',
    offset: -3,
  },
  {
    label: 'Paraguay Time',
    name: 'America/Asuncion',
    offset: -3,
  },
  {
    label: 'Punta Arenas Time',
    name: 'America/Punta_Arenas',
    offset: -3,
  },
  {
    label: 'Rothera Time',
    name: 'Antarctica/Rothera',
    offset: -3,
  },
  {
    label: 'St. Pierre & Miquelon Time',
    name: 'America/Miquelon',
    offset: -3,
  },
  {
    label: 'Suriname Time',
    name: 'America/Paramaribo',
    offset: -3,
  },
  {
    label: 'Uruguay Standard Time',
    name: 'America/Montevideo',
    offset: -3,
  },
  {
    label: 'West Greenland Time',
    name: 'America/Godthab',
    offset: -3,
  },
  {
    label: 'Western Argentina Standard Time',
    name: 'America/Argentina/San_Luis',
    offset: -3,
  },
  {
    label: 'Brasilia Time',
    name: 'America/Sao_Paulo',
    offset: -3,
  },
  {
    label: 'Fernando de Noronha Standard Time',
    name: 'America/Noronha',
    offset: -2,
  },
  {
    label: 'South Georgia Time',
    name: 'Atlantic/South_Georgia',
    offset: -2,
  },
  {
    label: 'Azores Time',
    name: 'Atlantic/Azores',
    offset: -1,
  },
  {
    label: 'Cape Verde Standard Time',
    name: 'Atlantic/Cape_Verde',
    offset: -1,
  },
  {
    label: 'East Greenland Time',
    name: 'America/Scoresbysund',
    offset: -1,
  },
  {
    label: 'Coordinated Universal Time',
    name: 'UTC',
    offset: 0,
  },
  {
    label: 'Greenwich Mean Time',
    name: 'Etc/GMT',
    offset: 0,
  },
  {
    label: 'Greenwich Mean Time - Abidjan',
    name: 'Africa/Abidjan',
    offset: 0,
  },
  {
    label: 'Greenwich Mean Time - Accra',
    name: 'Africa/Accra',
    offset: 0,
  },
  {
    label: 'Greenwich Mean Time - Bissau',
    name: 'Africa/Bissau',
    offset: 0,
  },
  {
    label: 'Greenwich Mean Time - Danmarkshavn',
    name: 'America/Danmarkshavn',
    offset: 0,
  },
  {
    label: 'Greenwich Mean Time - Monrovia',
    name: 'Africa/Monrovia',
    offset: 0,
  },
  {
    label: 'Greenwich Mean Time - Reykjavik',
    name: 'Atlantic/Reykjavik',
    offset: 0,
  },
  {
    label: 'Greenwich Mean Time - São Tomé',
    name: 'Africa/Sao_Tome',
    offset: 0,
  },
  {
    label: 'Ireland Time',
    name: 'Europe/Dublin',
    offset: 0,
  },
  {
    label: 'Troll Time',
    name: 'Antarctica/Troll',
    offset: 0,
  },
  {
    label: 'United Kingdom Time',
    name: 'Europe/London',
    offset: 0,
  },
  {
    label: 'Western European Time - Canary',
    name: 'Atlantic/Canary',
    offset: 0,
  },
  {
    label: 'Western European Time - Faroe',
    name: 'Atlantic/Faroe',
    offset: 0,
  },
  {
    label: 'Western European Time - Lisbon',
    name: 'Europe/Lisbon',
    offset: 0,
  },
  {
    label: 'Western European Time - Madeira',
    name: 'Atlantic/Madeira',
    offset: 0,
  },
  {
    label: 'Central European Standard Time - Algiers',
    name: 'Africa/Algiers',
    offset: 1,
  },
  {
    label: 'Central European Standard Time - Tunis',
    name: 'Africa/Tunis',
    offset: 1,
  },
  {
    label: 'Central European Time - Amsterdam',
    name: 'Europe/Amsterdam',
    offset: 1,
  },
  {
    label: 'Central European Time - Andorra',
    name: 'Europe/Andorra',
    offset: 1,
  },
  {
    label: 'Central European Time - Belgrade',
    name: 'Europe/Belgrade',
    offset: 1,
  },
  {
    label: 'Central European Time - Berlin',
    name: 'Europe/Berlin',
    offset: 1,
  },
  {
    label: 'Central European Time - Brussels',
    name: 'Europe/Brussels',
    offset: 1,
  },
  {
    label: 'Central European Time - Budapest',
    name: 'Europe/Budapest',
    offset: 1,
  },
  {
    label: 'Central European Time - Ceuta',
    name: 'Africa/Ceuta',
    offset: 1,
  },
  {
    label: 'Central European Time - Copenhagen',
    name: 'Europe/Copenhagen',
    offset: 1,
  },
  {
    label: 'Central European Time - Gibraltar',
    name: 'Europe/Gibraltar',
    offset: 1,
  },
  {
    label: 'Central European Time - Luxembourg',
    name: 'Europe/Luxembourg',
    offset: 1,
  },
  {
    label: 'Central European Time - Madrid',
    name: 'Europe/Madrid',
    offset: 1,
  },
  {
    label: 'Central European Time - Malta',
    name: 'Europe/Malta',
    offset: 1,
  },
  {
    label: 'Central European Time - Monaco',
    name: 'Europe/Monaco',
    offset: 1,
  },
  {
    label: 'Central European Time - Oslo',
    name: 'Europe/Oslo',
    offset: 1,
  },
  {
    label: 'Central European Time - Paris',
    name: 'Europe/Paris',
    offset: 1,
  },
  {
    label: 'Central European Time - Prague',
    name: 'Europe/Prague',
    offset: 1,
  },
  {
    label: 'Central European Time - Rome',
    name: 'Europe/Rome',
    offset: 1,
  },
  {
    label: 'Central European Time - Stockholm',
    name: 'Europe/Stockholm',
    offset: 1,
  },
  {
    label: 'Central European Time - Tirane',
    name: 'Europe/Tirane',
    offset: 1,
  },
  {
    label: 'Central European Time - Vienna',
    name: 'Europe/Vienna',
    offset: 1,
  },
  {
    label: 'Central European Time - Warsaw',
    name: 'Europe/Warsaw',
    offset: 1,
  },
  {
    label: 'Central European Time - Zurich',
    name: 'Europe/Zurich',
    offset: 1,
  },
  {
    label: 'Morocco Time',
    name: 'Africa/Casablanca',
    offset: 1,
  },
  {
    label: 'West Africa Standard Time - Lagos',
    name: 'Africa/Lagos',
    offset: 1,
  },
  {
    label: 'West Africa Standard Time - Ndjamena',
    name: 'Africa/Ndjamena',
    offset: 1,
  },
  {
    label: 'Western Sahara Time',
    name: 'Africa/El_Aaiun',
    offset: 1,
  },
  {
    label: 'Central Africa Time - Khartoum',
    name: 'Africa/Khartoum',
    offset: 2,
  },
  {
    label: 'Central Africa Time - Maputo',
    name: 'Africa/Maputo',
    offset: 2,
  },
  {
    label: 'Central Africa Time - Windhoek',
    name: 'Africa/Windhoek',
    offset: 2,
  },
  {
    label: 'Eastern European Standard Time - Cairo',
    name: 'Africa/Cairo',
    offset: 2,
  },
  {
    label: 'Eastern European Standard Time - Kaliningrad',
    name: 'Europe/Kaliningrad',
    offset: 2,
  },
  {
    label: 'Eastern European Standard Time - Tripoli',
    name: 'Africa/Tripoli',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Amman',
    name: 'Asia/Amman',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Athens',
    name: 'Europe/Athens',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Beirut',
    name: 'Asia/Beirut',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Bucharest',
    name: 'Europe/Bucharest',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Chisinau',
    name: 'Europe/Chisinau',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Damascus',
    name: 'Asia/Damascus',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Gaza',
    name: 'Asia/Gaza',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Hebron',
    name: 'Asia/Hebron',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Helsinki',
    name: 'Europe/Helsinki',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Kyiv',
    name: 'Europe/Kyiv',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Nicosia',
    name: 'Asia/Nicosia',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Riga',
    name: 'Europe/Riga',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Sofia',
    name: 'Europe/Sofia',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Tallinn',
    name: 'Europe/Tallinn',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Uzhhorod',
    name: 'Europe/Uzhgorod',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Vilnius',
    name: 'Europe/Vilnius',
    offset: 2,
  },
  {
    label: 'Eastern European Time - Zaporozhye',
    name: 'Europe/Zaporozhye',
    offset: 2,
  },
  {
    label: 'Famagusta Time',
    name: 'Asia/Famagusta',
    offset: 2,
  },
  {
    label: 'Israel Time',
    name: 'Asia/Jerusalem',
    offset: 2,
  },
  {
    label: 'South Africa Standard Time',
    name: 'Africa/Johannesburg',
    offset: 2,
  },
  {
    label: 'Arabian Standard Time - Baghdad',
    name: 'Asia/Baghdad',
    offset: 3,
  },
  {
    label: 'Arabian Standard Time - Qatar',
    name: 'Asia/Qatar',
    offset: 3,
  },
  {
    label: 'Arabian Standard Time - Riyadh',
    name: 'Asia/Riyadh',
    offset: 3,
  },
  {
    label: 'East Africa Time - Juba',
    name: 'Africa/Juba',
    offset: 3,
  },
  {
    label: 'East Africa Time - Nairobi',
    name: 'Africa/Nairobi',
    offset: 3,
  },
  {
    label: 'Kirov Time',
    name: 'Europe/Kirov',
    offset: 3,
  },
  {
    label: 'Moscow Standard Time - Minsk',
    name: 'Europe/Minsk',
    offset: 3,
  },
  {
    label: 'Moscow Standard Time - Moscow',
    name: 'Europe/Moscow',
    offset: 3,
  },
  {
    label: 'Moscow Standard Time - Simferopol',
    name: 'Europe/Simferopol',
    offset: 3,
  },
  {
    label: 'Syowa Time',
    name: 'Antarctica/Syowa',
    offset: 3,
  },
  {
    label: 'Turkey Time',
    name: 'Europe/Istanbul',
    offset: 3,
  },
  {
    label: 'Iran Time',
    name: 'Asia/Tehran',
    offset: 3.5,
  },
  {
    label: 'Armenia Standard Time',
    name: 'Asia/Yerevan',
    offset: 4,
  },
  {
    label: 'Astrakhan Time',
    name: 'Europe/Astrakhan',
    offset: 4,
  },
  {
    label: 'Azerbaijan Standard Time',
    name: 'Asia/Baku',
    offset: 4,
  },
  {
    label: 'Georgia Standard Time',
    name: 'Asia/Tbilisi',
    offset: 4,
  },
  {
    label: 'Gulf Standard Time',
    name: 'Asia/Dubai',
    offset: 4,
  },
  {
    label: 'Mauritius Standard Time',
    name: 'Indian/Mauritius',
    offset: 4,
  },
  {
    label: 'Réunion Time',
    name: 'Indian/Reunion',
    offset: 4,
  },
  {
    label: 'Samara Standard Time',
    name: 'Europe/Samara',
    offset: 4,
  },
  {
    label: 'Saratov Time',
    name: 'Europe/Saratov',
    offset: 4,
  },
  {
    label: 'Seychelles Time',
    name: 'Indian/Mahe',
    offset: 4,
  },
  {
    label: 'Ulyanovsk Time',
    name: 'Europe/Ulyanovsk',
    offset: 4,
  },
  {
    label: 'Volgograd Standard Time',
    name: 'Europe/Volgograd',
    offset: 4,
  },
  {
    label: 'Afghanistan Time',
    name: 'Asia/Kabul',
    offset: 4.5,
  },
  {
    label: 'French Southern & Antarctic Time',
    name: 'Indian/Kerguelen',
    offset: 5,
  },
  {
    label: 'Maldives Time',
    name: 'Indian/Maldives',
    offset: 5,
  },
  {
    label: 'Mawson Time',
    name: 'Antarctica/Mawson',
    offset: 5,
  },
  {
    label: 'Pakistan Standard Time',
    name: 'Asia/Karachi',
    offset: 5,
  },
  {
    label: 'Tajikistan Time',
    name: 'Asia/Dushanbe',
    offset: 5,
  },
  {
    label: 'Turkmenistan Standard Time',
    name: 'Asia/Ashgabat',
    offset: 5,
  },
  {
    label: 'Uzbekistan Standard Time - Samarkand',
    name: 'Asia/Samarkand',
    offset: 5,
  },
  {
    label: 'Uzbekistan Standard Time - Tashkent',
    name: 'Asia/Tashkent',
    offset: 5,
  },
  {
    label: 'West Kazakhstan Time - Aqtau',
    name: 'Asia/Aqtau',
    offset: 5,
  },
  {
    label: 'West Kazakhstan Time - Aqtobe',
    name: 'Asia/Aqtobe',
    offset: 5,
  },
  {
    label: 'West Kazakhstan Time - Atyrau',
    name: 'Asia/Atyrau',
    offset: 5,
  },
  {
    label: 'West Kazakhstan Time - Oral',
    name: 'Asia/Oral',
    offset: 5,
  },
  {
    label: 'West Kazakhstan Time - Qyzylorda',
    name: 'Asia/Qyzylorda',
    offset: 5,
  },
  {
    label: 'Yekaterinburg Standard Time',
    name: 'Asia/Yekaterinburg',
    offset: 5,
  },
  {
    label: 'India Standard Time - Colombo',
    name: 'Asia/Colombo',
    offset: 5.5,
  },
  {
    label: 'India Standard Time - Kolkata',
    name: 'Asia/Kolkata',
    offset: 5.5,
  },
  {
    label: 'India Standard Time - Calcutta',
    name: 'Asia/Calcutta',
    offset: 5.5,
  },
  {
    label: 'Nepal Time',
    name: 'Asia/Kathmandu',
    offset: 5.75,
  },
  {
    label: 'Bangladesh Standard Time',
    name: 'Asia/Dhaka',
    offset: 6,
  },
  {
    label: 'Bhutan Time',
    name: 'Asia/Thimphu',
    offset: 6,
  },
  {
    label: 'East Kazakhstan Time - Almaty',
    name: 'Asia/Almaty',
    offset: 6,
  },
  {
    label: 'East Kazakhstan Time - Qostanay',
    name: 'Asia/Qostanay',
    offset: 6,
  },
  {
    label: 'Indian Ocean Time',
    name: 'Indian/Chagos',
    offset: 6,
  },
  {
    label: 'Kyrgyzstan Time',
    name: 'Asia/Bishkek',
    offset: 6,
  },
  {
    label: 'Omsk Standard Time',
    name: 'Asia/Omsk',
    offset: 6,
  },
  {
    label: 'Urumqi Time',
    name: 'Asia/Urumqi',
    offset: 6,
  },
  {
    label: 'Vostok Time',
    name: 'Antarctica/Vostok',
    offset: 6,
  },
  {
    label: 'Cocos Islands Time',
    name: 'Indian/Cocos',
    offset: 6.5,
  },
  {
    label: 'Myanmar Time',
    name: 'Asia/Yangon',
    offset: 6.5,
  },
  {
    label: 'Barnaul Time',
    name: 'Asia/Barnaul',
    offset: 7,
  },
  {
    label: 'Christmas Island Time',
    name: 'Indian/Christmas',
    offset: 7,
  },
  {
    label: 'Davis Time',
    name: 'Antarctica/Davis',
    offset: 7,
  },
  {
    label: 'Hovd Standard Time',
    name: 'Asia/Hovd',
    offset: 7,
  },
  {
    label: 'Indochina Time - Bangkok',
    name: 'Asia/Bangkok',
    offset: 7,
  },
  {
    label: 'Indochina Time - Ho Chi Minh City',
    name: 'Asia/Ho_Chi_Minh',
    offset: 7,
  },
  {
    label: 'Krasnoyarsk Standard Time - Krasnoyarsk',
    name: 'Asia/Krasnoyarsk',
    offset: 7,
  },
  {
    label: 'Krasnoyarsk Standard Time - Novokuznetsk',
    name: 'Asia/Novokuznetsk',
    offset: 7,
  },
  {
    label: 'Novosibirsk Standard Time',
    name: 'Asia/Novosibirsk',
    offset: 7,
  },
  {
    label: 'Tomsk Time',
    name: 'Asia/Tomsk',
    offset: 7,
  },
  {
    label: 'Western Indonesia Time - Jakarta',
    name: 'Asia/Jakarta',
    offset: 7,
  },
  {
    label: 'Western Indonesia Time - Pontianak',
    name: 'Asia/Pontianak',
    offset: 7,
  },
  {
    label: 'Australian Western Standard Time - Casey',
    name: 'Antarctica/Casey',
    offset: 8,
  },
  {
    label: 'Australian Western Standard Time - Perth',
    name: 'Australia/Perth',
    offset: 8,
  },
  {
    label: 'Brunei Darussalam Time',
    name: 'Asia/Brunei',
    offset: 8,
  },
  {
    label: 'Central Indonesia Time',
    name: 'Asia/Makassar',
    offset: 8,
  },
  {
    label: 'China Standard Time - Macau',
    name: 'Asia/Macau',
    offset: 8,
  },
  {
    label: 'China Standard Time - Shanghai',
    name: 'Asia/Shanghai',
    offset: 8,
  },
  {
    label: 'Choibalsan Standard Time',
    name: 'Asia/Choibalsan',
    offset: 8,
  },
  {
    label: 'Hong Kong Standard Time',
    name: 'Asia/Hong_Kong',
    offset: 8,
  },
  {
    label: 'Irkutsk Standard Time',
    name: 'Asia/Irkutsk',
    offset: 8,
  },
  {
    label: 'Malaysia Time - Kuala Lumpur',
    name: 'Asia/Kuala_Lumpur',
    offset: 8,
  },
  {
    label: 'Malaysia Time - Kuching',
    name: 'Asia/Kuching',
    offset: 8,
  },
  {
    label: 'Philippine Standard Time',
    name: 'Asia/Manila',
    offset: 8,
  },
  {
    label: 'Singapore Standard Time',
    name: 'Asia/Singapore',
    offset: 8,
  },
  {
    label: 'Taipei Standard Time',
    name: 'Asia/Taipei',
    offset: 8,
  },
  {
    label: 'Ulaanbaatar Standard Time',
    name: 'Asia/Ulaanbaatar',
    offset: 8,
  },
  {
    label: 'Australian Central Western Standard Time',
    name: 'Australia/Eucla',
    offset: 8.75,
  },
  {
    label: 'East Timor Time',
    name: 'Asia/Dili',
    offset: 9,
  },
  {
    label: 'Eastern Indonesia Time',
    name: 'Asia/Jayapura',
    offset: 9,
  },
  {
    label: 'Japan Standard Time',
    name: 'Asia/Tokyo',
    offset: 9,
  },
  {
    label: 'Korean Standard Time - Pyongyang',
    name: 'Asia/Pyongyang',
    offset: 9,
  },
  {
    label: 'Korean Standard Time - Seoul',
    name: 'Asia/Seoul',
    offset: 9,
  },
  {
    label: 'Palau Time',
    name: 'Pacific/Palau',
    offset: 9,
  },
  {
    label: 'Yakutsk Standard Time - Chita',
    name: 'Asia/Chita',
    offset: 9,
  },
  {
    label: 'Yakutsk Standard Time - Khandyga',
    name: 'Asia/Khandyga',
    offset: 9,
  },
  {
    label: 'Yakutsk Standard Time - Yakutsk',
    name: 'Asia/Yakutsk',
    offset: 9,
  },
  {
    label: 'Australian Central Standard Time',
    name: 'Australia/Darwin',
    offset: 9.5,
  },
  {
    label: 'Australian Eastern Standard Time - Brisbane',
    name: 'Australia/Brisbane',
    offset: 10,
  },
  {
    label: 'Australian Eastern Standard Time - Lindeman',
    name: 'Australia/Lindeman',
    offset: 10,
  },
  {
    label: 'Chamorro Standard Time',
    name: 'Pacific/Guam',
    offset: 10,
  },
  {
    label: 'Chuuk Time',
    name: 'Pacific/Chuuk',
    offset: 10,
  },
  {
    label: 'Dumont-d’Urville Time',
    name: 'Antarctica/DumontDUrville',
    offset: 10,
  },
  {
    label: 'Papua New Guinea Time',
    name: 'Pacific/Port_Moresby',
    offset: 10,
  },
  {
    label: 'Vladivostok Standard Time - Ust-Nera',
    name: 'Asia/Ust-Nera',
    offset: 10,
  },
  {
    label: 'Vladivostok Standard Time - Vladivostok',
    name: 'Asia/Vladivostok',
    offset: 10,
  },
  {
    label: 'Central Australia Time - Adelaide',
    name: 'Australia/Adelaide',
    offset: 10.5,
  },
  {
    label: 'Central Australia Time - Broken Hill',
    name: 'Australia/Broken_Hill',
    offset: 10.5,
  },
  {
    label: 'Bougainville Time',
    name: 'Pacific/Bougainville',
    offset: 11,
  },
  {
    label: 'Eastern Australia Time - Currie',
    name: 'Australia/Currie',
    offset: 11,
  },
  {
    label: 'Eastern Australia Time - Hobart',
    name: 'Australia/Hobart',
    offset: 11,
  },
  {
    label: 'Eastern Australia Time - Melbourne',
    name: 'Australia/Melbourne',
    offset: 11,
  },
  {
    label: 'Eastern Australia Time - Sydney',
    name: 'Australia/Sydney',
    offset: 11,
  },
  {
    label: 'Kosrae Time',
    name: 'Pacific/Kosrae',
    offset: 11,
  },
  {
    label: 'Lord Howe Time',
    name: 'Australia/Lord_Howe',
    offset: 11,
  },
  {
    label: 'Macquarie Island Time',
    name: 'Antarctica/Macquarie',
    offset: 11,
  },
  {
    label: 'Magadan Standard Time',
    name: 'Asia/Magadan',
    offset: 11,
  },
  {
    label: 'New Caledonia Standard Time',
    name: 'Pacific/Noumea',
    offset: 11,
  },
  {
    label: 'Norfolk Island Time',
    name: 'Pacific/Norfolk',
    offset: 11,
  },
  {
    label: 'Ponape Time',
    name: 'Pacific/Pohnpei',
    offset: 11,
  },
  {
    label: 'Sakhalin Standard Time',
    name: 'Asia/Sakhalin',
    offset: 11,
  },
  {
    label: 'Solomon Islands Time',
    name: 'Pacific/Guadalcanal',
    offset: 11,
  },
  {
    label: 'Srednekolymsk Time',
    name: 'Asia/Srednekolymsk',
    offset: 11,
  },
  {
    label: 'Vanuatu Standard Time',
    name: 'Pacific/Efate',
    offset: 11,
  },
  {
    label: 'Anadyr Standard Time',
    name: 'Asia/Anadyr',
    offset: 12,
  },
  {
    label: 'Fiji Time',
    name: 'Pacific/Fiji',
    offset: 12,
  },
  {
    label: 'Gilbert Islands Time',
    name: 'Pacific/Tarawa',
    offset: 12,
  },
  {
    label: 'Marshall Islands Time - Kwajalein',
    name: 'Pacific/Kwajalein',
    offset: 12,
  },
  {
    label: 'Marshall Islands Time - Majuro',
    name: 'Pacific/Majuro',
    offset: 12,
  },
  {
    label: 'Nauru Time',
    name: 'Pacific/Nauru',
    offset: 12,
  },
  {
    label: 'Petropavlovsk-Kamchatski Standard Time',
    name: 'Asia/Kamchatka',
    offset: 12,
  },
  {
    label: 'Tuvalu Time',
    name: 'Pacific/Funafuti',
    offset: 12,
  },
  {
    label: 'Wake Island Time',
    name: 'Pacific/Wake',
    offset: 12,
  },
  {
    label: 'Wallis & Futuna Time',
    name: 'Pacific/Wallis',
    offset: 12,
  },
  {
    label: 'New Zealand Time',
    name: 'Pacific/Auckland',
    offset: 13,
  },
  {
    label: 'Phoenix Islands Time',
    name: 'Pacific/Enderbury',
    offset: 13,
  },
  {
    label: 'Tokelau Time',
    name: 'Pacific/Fakaofo',
    offset: 13,
  },
  {
    label: 'Tonga Standard Time',
    name: 'Pacific/Tongatapu',
    offset: 13,
  },
  {
    label: 'Chatham Time',
    name: 'Pacific/Chatham',
    offset: 13.75,
  },
  {
    label: 'Apia Time',
    name: 'Pacific/Apia',
    offset: 14,
  },
  {
    label: 'Line Islands Time',
    name: 'Pacific/Kiritimati',
    offset: 14,
  },
];
