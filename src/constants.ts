export const GithubUrl = 'https://github.com/communityox';
export const GithubApi = 'https://api.github.com/repos/communityox';
export const DocsUrl = 'https://coxdocs.dev';

export const Resources = [
  'ox_lib',
  'ox_inventory',
  'oxmysql',
  'ox_core',
  'ox_fuel',
  'ox_target',
  'ox_doorlock',
  'ox_types',
  'ox_mdt',
  'ox_banking',
  'ox_commands',
];

export const ResourceChoices = (() => {
  const arr: { name: string; value: string }[] = new Array(Resources.length);

  Resources.forEach((value, index) => {
    arr[index] = { name: value, value: value };
  });

  return arr;
})();

export const Roles: Record<string, string> = {
  Cox: '1367097096972406814',
  LegacyOx: '1367888513013383280',
  Moderator: '1367628486117949440',
  RecognizedMember: '1367126506958098513',
  GitHub: '1369761529788108910',
  SupportAccess: '1373360625887215616',
  WardenTag: '1367126592446267425',
  Member: '1367235724935696506',
}

export const Channels: Record<string, string> = {
  Guidelines: '1370839046494093344',
  BookClub: '1367098557169143858',
  General: '1367096781308952609',
  Shitposting: '1367099791959658536',
  Entertainment: '1369649770708074556',
}
