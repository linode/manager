import { containsClick, containsVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import {
  interceptGetStackScripts,
  mockGetStackScripts,
} from 'support/intercepts/stackscripts';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import {
  filterOneClickApps,
  handleAppLabel,
} from 'src/features/Linodes/LinodesCreate/utilities';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import {
  interceptFeatureFlags,
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mapStackScriptLabelToOCA } from 'src/features/OneClickApps/utils';
import { baseApps } from 'src/features/StackScripts/stackScriptUtils';
import { stackScriptFactory } from 'src/factories/stackscripts';
import { oneClickApps } from 'src/features/OneClickApps/OneClickApps';

import type { StackScript } from '@linode/api-v4';
import type { OCA } from '@src/features/OneClickApps/types';

authenticate();

describe('OneClick Apps (OCA)', () => {
  before(() => {
    cleanUp(['linodes']);
  });

  it('Lists all the OneClick Apps', () => {
    interceptGetStackScripts().as('getStackScripts');
    interceptFeatureFlags().as('getFeatureFlags');

    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getStackScripts').then((xhr) => {
      const stackScripts: StackScript[] = xhr.response?.body.data ?? [];

      const trimmedApps: StackScript[] = filterOneClickApps({
        baseApps,
        newApps: {},
        queryResults: stackScripts,
      });

      // Check the content of the OCA listing
      cy.findByTestId('one-click-apps-container').within(() => {
        // Check that all sections are present (note: New apps can be empty so not asserting its presence)
        cy.findByTestId('Popular apps').should('exist');
        cy.findByTestId('All apps').should('exist');

        trimmedApps.forEach((stackScript) => {
          const { decodedLabel, label } = handleAppLabel(stackScript);

          // Check that every OCA is listed with the correct label
          cy.get(`[data-qa-select-card-heading="${label}"]`).should('exist');

          // Check that every OCA has a drawer match
          // This validates the regex in `mapStackScriptLabelToOCA`
          // and ensures every app listed has a corresponding populated drawer
          // This is only true for the apps defined in `oneClickApps.ts`
          expect(
            mapStackScriptLabelToOCA({
              oneClickApps,
              stackScriptLabel: decodedLabel,
            })
          ).to.not.be.undefined;
        });
      });

      // Check drawer content for one OCA candidate
      const candidate = trimmedApps[0].label;
      const stackScriptCandidate = cy
        .get(`[data-qa-selection-card-info="${candidate}"]`)
        .first();
      stackScriptCandidate.should('exist').click();

      const app: OCA | undefined = mapStackScriptLabelToOCA({
        oneClickApps,
        stackScriptLabel: candidate,
      });

      ui.drawer
        .findByTitle(trimmedApps[0].label)
        .should('be.visible')
        .within(() => {
          containsVisible(app?.description);
          containsVisible(app?.summary);
          containsVisible(app?.website);
        });
      ui.drawerCloseButton.find().click();
      ui.drawer.find().should('not.exist');

      // Check the filtering of the apps
      cy.scrollTo(0, 0);
      const initialNumberOfApps = trimmedApps.length;
      cy.findByPlaceholderText('Search for app name')
        .should('exist')
        .type(candidate);
      cy.findByTestId('one-click-apps-container').within(() => {
        cy.get('[data-qa-selection-card="true"]').should(
          'have.length.below',
          initialNumberOfApps
        );
        cy.get(`[data-qa-selection-card-info="${candidate}"]`).should(
          'be.visible'
        );
      });
    });
  });

  it('Deploys a Linode from a One Click App', () => {
    const stackscriptId = 401709;
    const stackScripts = stackScriptFactory.build({
      id: stackscriptId,
      username: 'linode',
      user_gravatar_id: '9d4d301385af69ceb7ad658aad09c142',
      label: 'E2E Test App',
      description: 'Minecraft OCA',
      ordinal: 10,
      logo_url: 'assets/Minecraft.svg',
      images: ['linode/debian11', 'linode/ubuntu20.04'],
      deployments_total: 18854,
      deployments_active: 412,
      is_public: true,
      mine: false,
      created: '2019-03-08T21:13:32',
      updated: '2023-09-26T15:00:45',
      rev_note: 'remove maxplayers hard coded options [oca-707]',
      script:
        '#!/usr/bin/env bash\n# Game config options:\n# https://minecraft.gamepedia.com/Server.properties\n#<UDF name="levelname" label="World Name" default="world" />\n#<UDF name="motd" label="Message of the Day" default="Powered by Linode!" />\n#<UDF name="allowflight" label="Flight Enabled" oneOf="true,false" default="false" />\n#<UDF name="allownether" label="Nether World Enabled" oneOf="true,false" default="true" />\n#<UDF name="announceplayerachievements" label="Player Achievements Enabled" oneOf="true,false" default="true" />\n#<UDF name="maxplayers" label="Maximum Players" default="25" />\n#<UDF name="playeridletimeout" label="Player Idle Timeout Limit" oneOf="Disabled,15,30,45,60" default="Disabled" />\n#<UDF name="difficulty" label="Difficulty Level" oneOF="Peaceful,Easy,Normal,Hard" default="Easy" />\n#<UDF name="hardcore" label="Hardcore Mode Enabled" oneOf="true,false" default="false" />\n#<UDF name="pvp" label="PvP Enabled" oneOf="true,false" default="true" />\n#<UDF name="forcegamemode" label="Force Game Mode Enabled" oneOf="true,false" default="false" />\n#<UDF name="leveltype" label="World Type" oneOf="DEFAULT,AMPLIFIED,FLAT,LEGACY"default="DEFAULT" />\n#<UDF name="levelseed" label="World Seed" default="" />\n#<UDF name="spawnanimals" label="Spawn Animals Enabled" oneOf="true,false" default="true" />\n#<UDF name="spawnmonsters" label="Spawn Monsters Enabled" oneOf="true,false" default="true" />\n#<UDF name="spawnnpcs" label="Spawn NPCs Enabled" oneOf="true,false" default="true" />\n#<UDF name="gamemode" label="Game Mode" oneOf="Survival,Creative,Adventure,Spectator" default="Survival" />\n#<UDF name="generatestructures" label="Structure Generation Enabled" oneOf="true,false" default="true" />\n#<UDF name="maxbuildheight" label="Maximum Build Height" oneOf="50,100,200,256" default="256" />\n#<UDF name="maxworldsize" label="Maximum World Size" oneOf="100,1000,10000,100000,1000000,10000000,29999984" default="29999984" />\n#<UDF name="viewdistance" label="View Distance" oneOf="2,5,10,15,25,32" default="10" />\n#<UDF name="enablecommandblock" label="Command Block Enabled" oneOf="true,false" default="false" />\n#<UDF name="enablequery" label="Querying Enabled" oneOf="true,false" default="true" />\n#<UDF name="enablercon" label="Enable RCON" oneOf="true,false" default="false" />\n#<UDF name="rconpassword" label="RCON Password" default="" />\n#<UDF name="rconport" label="RCON Port" default="25575" />\n#<UDF name="maxticktime" label="Maximum Tick Time" default="60000" />\n#<UDF name="networkcompressionthreshold" label="Network Compression Threshold" default="256" />\n#<UDF name="oppermissionlevel" label="Op-permission Level" oneOf="1,2,3,4" default="4" />\n#<UDF name="port" label="Port Number" default="25565" />\n#<UDF name="snooperenabled" label="Snooper Enabled" oneOf="true,false" default="true" />\n#<UDF name="usenativetransport" label="Use Native Transport Enabled" oneOf="true,false" default="true" />\n## Linode/SSH Security Settings - Required\n#<UDF name="username" label="The username for the Linode\'s non-root admin/SSH user(must be lowercase)" example="lgsmuser">\n#<UDF name="password" label="The password for the Linode\'s non-root admin/SSH user" example="S3cuReP@s$w0rd">\n## Linode/SSH Settings - Optional\n#<UDF name="pubkey" label="The SSH Public Key used to securely access the Linode via SSH" default="">\n#<UDF name="disable_root" label="Disable root access over SSH?" oneOf="Yes,No" default="No">\n\n# Enable logging for the StackScript\nset -xo pipefail\nexec > >(tee /dev/ttyS0 /var/log/stackscript.log) 2>&1\n\n# Source the Linode Bash StackScript, API, and LinuxGSM Helper libraries\nsource <ssinclude StackScriptID=1>\nsource <ssinclude StackScriptID=632759>\nsource <ssinclude StackScriptID=401711>\n\n# Source and run the New Linode Setup script for DNS/SSH configuration\n[ ! $USERNAME ] && USERNAME=\'lgsmuser\'\nsource <ssinclude StackScriptID=666912>\n\n# Difficulty\n[[ "$DIFFICULTY" = "Peaceful" ]] && DIFFICULTY=0\n[[ "$DIFFICULTY" = "Easy" ]] && DIFFICULTY=1\n[[ "$DIFFICULTY" = "Normal" ]] && DIFFICULTY=2\n[[ "$DIFFICULTY" = "Hard" ]] && DIFFICULTY=3\n\n# Gamemode\n[[ "$GAMEMODE" = "Survival" ]] && GAMEMODE=0\n[[ "$GAMEMODE" = "Creative" ]] && GAMEMODE=1\n[[ "$GAMEMODE" = "Adventure" ]] && GAMEMODE=2\n[[ "$GAMEMODE" = "Spectator" ]] && GAMEMODE=3\n\n# Player Idle Timeout\n[[ "$PLAYERIDLETIMEOUT" = "Disabled" ]] && PLAYERIDLETIMEOUT=0\n\n# Minecraft-specific dependencies\ndebconf-set-selections <<< "postfix postfix/main_mailer_type string \'No Configuration\'"\ndebconf-set-selections <<< "postfix postfix/mailname string `hostname`"\ndpkg --add-architecture i386\nsystem_install_package mailutils postfix curl netcat wget file bzip2 \\\n                       gzip unzip bsdmainutils python util-linux ca-certificates \\\n                       binutils bc jq tmux openjdk-17-jre dirmngr software-properties-common\n\n# Install LinuxGSM and Minecraft and enable the \'mcserver\' service\nreadonly GAMESERVER=\'mcserver\'\nv_linuxgsm_oneclick_install "$GAMESERVER" "$USERNAME"\n\n# Minecraft configurations\nsed -i s/server-ip=/server-ip="$IP"/ /home/"$USERNAME"/serverfiles/server.properties\n\n# Customer config\nsed -i s/allow-flight=false/allow-flight="$ALLOWFLIGHT"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/allow-nether=true/allow-nether="$ALLOWNETHER"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/announce-player-achievements=true/announce-player-achievements="$ANNOUNCEPLAYERACHIEVEMENTS"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/difficulty=1/difficulty="$DIFFICULTY"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/enable-command-block=false/enable-command-block="$ENABLECOMMANDBLOCK"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/enable-query=true/enable-query="$ENABLEQUERY"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/force-gamemode=false/force-gamemode="$FORCEGAMEMODE"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/gamemode=0/gamemode="$GAMEMODE"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/generate-structures=true/generate-structures="$GENERATESTRUCTURES"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/hardcore=false/hardcore="$HARDCORE"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/level-name=world/level-name="$LEVELNAME"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/level-seed=/level-seed="$LEVELSEED"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/level-type=DEFAULT/level-type="$LEVELTYPE"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/max-build-height=256/max-build-height="$MAXBUILDHEIGHT"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/max-players=20/max-players="$MAXPLAYERS"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/max-tick-time=60000/max-tick-time="$MAXTICKTIME"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/max-world-size=29999984/max-world-size="$MAXWORLDSIZE"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/motd=.*/motd="$MOTD"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/network-compression-threshold=256/network-compression-threshold="$NETWORKCOMPRESSIONTHRESHOLD"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/op-permission-level=4/op-permission-level="$OPPERMISSIONLEVEL"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/player-idle-timeout=0/player-idle-timeout="$PLAYERIDLETIMEOUT"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/pvp=true/pvp="$PVP"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/resource-pack-sha1=/resource-pack-sha1="$RESOURCEPACKSHA1"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/server-port=25565/server-port="$PORT"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/snooper-enabled=true/snooper-enabled="$SNOOPERENABLED"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/spawn-animals=true/spawn-animals="$SPAWNANIMALS"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/spawn-monsters=true/spawn-monsters="$SPAWNMONSTERS"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/spawn-npcs=true/spawn-npcs="$SPAWNNPCS"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/use-native-transport=true/use-native-transport="$USENATIVETRANSPORT"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/view-distance=10/view-distance="$VIEWDISTANCE"/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/rcon.password=*/rcon.password="\\"$RCONPASSWORD\\""/ /home/"$USERNAME"/serverfiles/server.properties\nsed -i s/enable-rcon=false/enable-rcon=true/ /home/"$USERNAME"/serverfiles/server.properties\n\n# Start the service and setup firewall\nufw allow "$PORT"\nufw allow "25575"\n\n# Start and enable the Minecraft service\nsystemctl start "$GAMESERVER".service\nsystemctl enable "$GAMESERVER".service\n\n# Cleanup\nstackscript_cleanup',
      user_defined_fields: [
        {
          name: 'username',
          label:
            "The username for the Linode's non-root admin/SSH user(must be lowercase)",
          example: 'lgsmuser',
        },
        {
          name: 'password',
          label: "The password for the Linode's non-root admin/SSH user",
          example: 'S3cuReP@s$w0rd',
        },
        {
          name: 'levelname',
          label: 'World Name',
        },
      ],
    });

    const firstName = randomLabel();
    const password = randomString(16);
    const image = 'linode/ubuntu20.04';
    const rootPassword = randomString(16);
    const region = chooseRegion();
    const linodeLabel = randomLabel();
    const levelName = 'Get the enderman!';

    mockGetStackScripts(stackScripts).as('getStackScripts');
    mockAppendFeatureFlags({
      oneClickApps: makeFeatureFlagData({
        401709: 'E2E Test App',
      }),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin(`/linodes/create?type=One-Click`);

    cy.wait('@getFeatureFlags');
    cy.wait('@getStackScripts');

    cy.findByTestId('one-click-apps-container').within(() => {
      // Since it is mock data we can assert the New App section is present
      cy.findByTestId('New apps').should('exist');

      // Check that the app is listed and select it
      cy.get('[data-qa-selection-card="true"]').should('have.length', 3);
      cy.get(`[id=app-${stackscriptId}]`).first().should('be.visible').click();
    });

    // Input the user defined fields
    const userFieldId =
      "the-username-for-the-linode's-non-root-admin/ssh-user(must-be-lowercase)";
    const passwordFieldId =
      "the-password-for-the-linode's-non-root-admin/ssh-user";
    const levelNameFieldId = 'world-name';

    cy.findByTestId('user-defined-fields-panel').within(() => {
      cy.get(`[id="${userFieldId}"]`)
        .should('be.visible')
        .click()
        .type(`${firstName}{enter}`);
      cy.get(`[id="${passwordFieldId}"]`)
        .should('be.visible')
        .click()
        .type(`${password}{enter}`);
      cy.get(`[id="${levelNameFieldId}"]`)
        .should('be.visible')
        .click()
        .type(`${levelName}{enter}`);

      // Check each field should persist when moving onto another field
      cy.get(`[id="${userFieldId}"]`).should('have.value', firstName);
      cy.get(`[id="${passwordFieldId}"]`).should('have.value', password);
      cy.get(`[id="${levelNameFieldId}"]`).should('have.value', levelName);
    });

    // Choose an image
    cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
      containsClick('Choose an image').type(`${image}{enter}`);
    });

    // Choose a region
    cy.get(`[data-qa-enhanced-select="Select a Region"]`).within(() => {
      containsClick('Select a Region').type(`${region.id}{enter}`);
    });

    // Choose a Linode plan
    cy.get('[data-qa-plan-row="Dedicated 8 GB"]')
      .closest('tr')
      .within(() => {
        cy.get('[data-qa-radio]').click();
      });

    // Enter a label.
    cy.findByText('Linode Label')
      .should('be.visible')
      .click()
      .type('{selectAll}{backspace}')
      .type(linodeLabel);

    // Choose a Root Password
    cy.get('[id="root-password"]').type(rootPassword);

    // Create the Linode
    interceptCreateLinode().as('createLinode');
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode');
    ui.toast.assertMessage(`Your Linode ${linodeLabel} is being created.`);
  });
});
