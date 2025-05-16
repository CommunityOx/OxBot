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

// ignored role IDs for onMessageCreate.ts
export const ignoredRoles = [
  '1367097096972406814', // Cox
  '1367888513013383280', // Legacy Ox
  '1367628486117949440', // Moderator
  '1367126506958098513', // Recognized Member
  '1369761529788108910', // GitHub
];

// channel ID for support-guidelines
export const guidelines = '<#1370839046494093344>';

export const whitelistedChannels = [
  '1367098557169143858', // book-club
];

export const channelIdNames: Record<string, string> = {
  '1367096781308952609': 'general',
  '1367099791959658536': 'shitposting',
  '1369649770708074556': 'entertainment',
}
