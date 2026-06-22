import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class Subsale extends Model {
    static associate(models) {
      // Define associations here if needed, based on the foreign keys
      Subsale.belongsTo(models.Country, {
        foreignKey: 'country_id',
        as: 'country',
      })
      Subsale.belongsTo(models.State, { foreignKey: 'state_id', as: 'state' })
      Subsale.belongsTo(models.City, { foreignKey: 'city_id', as: 'city' })
      Subsale.belongsTo(models.PropertyType, {
        foreignKey: 'property_type_id',
        as: 'property_type',
      })
      Subsale.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' })
      // Subsale.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })

      Subsale.hasMany(models.SubsaleContent, {
        foreignKey: 'subsale_id',
        as: 'contents',
      })
      Subsale.hasMany(models.SubsaleDescription, {
        foreignKey: 'subsale_id',
        as: 'descriptions',
      })
      Subsale.hasMany(models.SubsaleFurnishList, {
        foreignKey: 'subsale_id',
        as: 'furnish_list',
      })
      Subsale.hasMany(models.SubsaleRoom, {
        foreignKey: 'subsale_id',
        as: 'rooms',
      })
      Subsale.belongsTo(models.SubsaleTypeValue, {
        foreignKey: 'type',
        as: 'subsale_type',
      })
    }
  }

  Subsale.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      country_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      state_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      city_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      property_type_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      agent_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      unit_number: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      parking_spot: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      level: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      floor: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      unit_type: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      direction: {
        type: DataTypes.ENUM(
          'north',
          'north-east',
          'east',
          'south-east',
          'south',
          'south-west',
          'west',
          'north-west',
          'unknown'
        ),
        allowNull: false,
        defaultValue: 'unknown',
      },
      occupancy: {
        type: DataTypes.ENUM(
          'vacant',
          'owner-occupied',
          'tenanted',
          'partially-tenanted'
        ),
        allowNull: false,
        defaultValue: 'vacant',
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      asking_price: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
      },
      price_type: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      price_variation: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      sqft: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
      },
      sqm: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
      },
      tenure: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      lease_term: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      renting_opt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1, // optional
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment:
          '0=pending, 1=in_queue, 2=process, 3=in_review, 4=success, 8=rejected, 9=failed',
      },
      furnish_status: {
        type: DataTypes.ENUM('fully', 'partially', 'unfurnished'),
        allowNull: false,
        defaultValue: 'unfurnished',
      },
      title: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      land_title: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      land_area: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      land_width: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      land_height: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      property_portals: {
        type: DataTypes.TEXT,
        allowNull: true,

        get() {
          const raw = this.getDataValue('property_portals')
          if (!raw) return []

          try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
          } catch (e) {
            return []
          }
        },

        set(value) {
          // ensure we always store valid JSON string
          this.setDataValue(
            'property_portals',
            JSON.stringify(Array.isArray(value) ? value : [])
          )
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'Subsale',
      // tableName: 'v_subsales',
      tableName: 'subsales',
      timestamps: false, // Views are typically read-only or managed elsewhere
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: 'subsales_country_id_foreign',
          fields: ['country_id'],
        },
        {
          name: 'subsales_state_id_foreign',
          fields: ['state_id'],
        },
        {
          name: 'subsales_city_id_foreign',
          fields: ['city_id'],
        },
        {
          name: 'subsales_project_type_id_foreign',
          fields: ['project_type_id'],
        },
        {
          name: 'subsales_agent_id_foreign',
          fields: ['agent_id'],
        },
        {
          name: 'subsales_user_id_foreign',
          fields: ['user_id'],
        },
        {
          name: 'subsales_floor_index',
          fields: ['floor'],
        },
        {
          name: 'subsales_unit_type_index',
          fields: ['unit_type'],
        },
        {
          name: 'subsales_price_type_index',
          fields: ['price_type'],
        },
        {
          name: 'subsales_price_variation_index',
          fields: ['price_variation'],
        },
        {
          name: 'subsales_tenure_index',
          fields: ['tenure'],
        },
        {
          name: 'subsales_status_index',
          fields: ['status'],
        },
        {
          name: 'subsales_title_index',
          fields: ['title'],
        },
        {
          name: 'subsales_land_title_index',
          fields: ['land_title'],
        },
      ],
    }
  )

  return Subsale
}
